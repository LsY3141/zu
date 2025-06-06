const { transcribeService } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

// 음성 변환 작업 시작
const startTranscriptionJob = async (audioUrl, params = {}) => {
  console.log('Transcribe 작업 시작 서비스 시작');
  console.log('오디오 URL:', audioUrl);
  console.log('Transcribe 파라미터:', params);
  
  try {
    const jobName = `transcribe-job-${uuidv4()}`;
    console.log('생성된 작업 이름:', jobName);
    
    const defaultParams = {
      TranscriptionJobName: jobName,
      LanguageCode: params.languageCode || 'ko-KR',
      MediaFormat: params.mediaFormat || 'wav', // 파일 형식 (mp3, wav, m4a 등)
      Media: {
        MediaFileUri: audioUrl
      },
      Settings: {
        ShowSpeakerLabels: params.showSpeakerLabels || true, // 화자 구분
        MaxSpeakerLabels: params.maxSpeakerLabels || 10, // 최대 화자 수
      }
    };
    
    console.log('Transcribe API 요청 파라미터:', JSON.stringify(defaultParams, null, 2));
    
    console.log('Transcribe API 호출 시작');
    const result = await transcribeService.startTranscriptionJob(defaultParams).promise();
    console.log('Transcribe 작업 시작 성공:', {
      jobName: result.TranscriptionJob.TranscriptionJobName,
      status: result.TranscriptionJob.TranscriptionJobStatus
    });
    
    return {
      jobId: result.TranscriptionJob.TranscriptionJobName,
      status: result.TranscriptionJob.TranscriptionJobStatus
    };
  } catch (error) {
    console.error('Transcribe 작업 시작 오류:', error);
    console.error('오류 스택:', error.stack);
    throw error;
  }
};

// 음성 변환 작업 상태 확인
const getTranscriptionJob = async (jobId) => {
  console.log('Transcribe 작업 상태 확인 서비스 시작, 작업 ID:', jobId);
  
  try {
    const result = await transcribeService.getTranscriptionJob({
      TranscriptionJobName: jobId
    }).promise();
    
    const job = result.TranscriptionJob;
    console.log('Transcribe 작업 정보:', {
      jobName: job.TranscriptionJobName,
      status: job.TranscriptionJobStatus,
      createdAt: job.CreationTime,
      completedAt: job.CompletionTime,
      transcript: job.Transcript ? '있음' : '없음',
      transcriptUri: job.Transcript?.TranscriptFileUri ? '있음' : '없음',
      transcriptObject: job.Transcript ? JSON.stringify(job.Transcript) : '없음'
    });
    
    // 진행률 계산
    let progress = 0;
    if (job.TranscriptionJobStatus === 'IN_PROGRESS') {
      const startTime = new Date(job.CreationTime);
      const now = new Date();
      const elapsed = (now - startTime) / 1000;
      progress = Math.min(Math.round(elapsed / 10 * 100), 95);
    } else if (job.TranscriptionJobStatus === 'COMPLETED') {
      progress = 100;
    } else if (job.TranscriptionJobStatus === 'FAILED') {
      progress = 0;
    }
    
    // TranscriptFileUri 확인 - 더 강력한 감지
    let transcriptUrl = null;
    
    // 1차: 정상적인 완료 상태 확인
    if (job.TranscriptionJobStatus === 'COMPLETED' && job.Transcript && job.Transcript.TranscriptFileUri) {
      transcriptUrl = job.Transcript.TranscriptFileUri;
      console.log('정상 완료 - TranscriptFileUri 확인됨:', transcriptUrl);
    } 
    // 2차: 상태와 관계없이 TranscriptFileUri가 있으면 완료된 것으로 처리
    else if (job.Transcript && job.Transcript.TranscriptFileUri) {
      transcriptUrl = job.Transcript.TranscriptFileUri;
      progress = 100;
      console.log('상태 무관 - TranscriptFileUri 존재하므로 완료로 처리:', transcriptUrl);
    }
    // 3차: progress가 95% 이상이고 transcript 객체가 있으면 잠시 후 재시도하라는 신호
    else if (progress >= 95 && job.Transcript) {
      console.log('95% 이상 진행 + transcript 객체 존재 - 곧 완료될 예정');
      // 아직 URL이 없으므로 IN_PROGRESS 유지
    }
    // 4차: 강제로 다시 한 번 확인 (AWS Transcribe 버그 대응)
    else if (progress >= 95) {
      console.log('진행률 95% 이상 - 강제 재확인 필요');
      try {
        // 잠시 기다린 후 다시 확인
        console.log('1초 대기 후 재확인...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryResult = await transcribeService.getTranscriptionJob({
          TranscriptionJobName: jobId
        }).promise();
        
        const retryJob = retryResult.TranscriptionJob;
        if (retryJob.Transcript && retryJob.Transcript.TranscriptFileUri) {
          transcriptUrl = retryJob.Transcript.TranscriptFileUri;
          progress = 100;
          console.log('재확인 성공 - TranscriptFileUri 발견:', transcriptUrl);
        }
      } catch (retryError) {
        console.error('재확인 중 오류:', retryError);
      }
    }
    
    const response = {
      jobId: job.TranscriptionJobName,
      status: transcriptUrl ? 'COMPLETED' : job.TranscriptionJobStatus, // TranscriptFileUri가 있으면 완료로 처리
      progress: transcriptUrl ? 100 : progress,
      url: transcriptUrl,
      createdAt: job.CreationTime,
      completedAt: job.CompletionTime
    };
    
    console.log('서비스 응답:', response);
    return response;
    
  } catch (error) {
    console.error('Transcribe 작업 상태 확인 오류:', error);
    throw error;
  }
};

// 변환된 결과 가져오기 (JSON 파일에서 텍스트 추출)
const getTranscriptionResults = async (uri) => {
  console.log('Transcribe 결과 가져오기 서비스 시작');
  console.log('결과 URI:', uri);
  
  return new Promise((resolve, reject) => {
    const https = require('https');
    const url = require('url');
    
    console.log('HTTPS 요청 시작');
    const parsedUrl = url.parse(uri);
    
    https.get(parsedUrl.href, (res) => {
      console.log('HTTPS 응답 상태 코드:', res.statusCode);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('데이터 수신 완료, 파싱 시작');
          const result = JSON.parse(data);
          
          // 기본 전체 텍스트
          const transcript = result.results.transcripts[0].transcript;
          console.log('파싱된 텍스트 길이:', transcript.length);
          
          // 화자 구분이 있는 경우
          let speakers = [];
          if (result.results.speaker_labels && result.results.speaker_labels.segments) {
            console.log('화자 구분 정보 발견, 처리 시작');
            const items = result.results.items;
            const segments = result.results.speaker_labels.segments;
            
            console.log('발견된 세그먼트 수:', segments.length);
            console.log('발견된 단어 항목 수:', items.length);
            
            // 화자별 텍스트 조합
            const speakerSegments = {};
            
            segments.forEach(segment => {
              const speakerId = segment.speaker_label;
              
              if (!speakerSegments[speakerId]) {
                speakerSegments[speakerId] = '';
              }
              
              segment.items.forEach(segmentItem => {
                const matchingItem = items.find(item => 
                  item.start_time === segmentItem.start_time && 
                  item.end_time === segmentItem.end_time
                );
                
                if (matchingItem) {
                  speakerSegments[speakerId] += ' ' + matchingItem.alternatives[0].content;
                }
              });
            });
            
            // 화자별 텍스트 배열로 변환
            speakers = Object.keys(speakerSegments).map(id => ({
              id,
              text: speakerSegments[id].trim()
            }));
            
            console.log('화자 구분 처리 완료, 화자 수:', speakers.length);
          } else {
            console.log('화자 구분 정보 없음');
          }
          
          const result2 = {
            text: transcript,
            speakers: speakers.length > 0 ? speakers : null
          };
          
          console.log('Transcribe 결과 파싱 성공');
          resolve(result2);
        } catch (err) {
          console.error('Transcribe 결과 파싱 오류:', err);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.error('HTTPS 요청 오류:', err);
      reject(err);
    });
  });
};

module.exports = {
  startTranscriptionJob,
  getTranscriptionJob,
  getTranscriptionResults
};
