import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: 100%;
    width: 100%;
    font-family: ${props => props.theme.fonts.body};
    font-size: ${props => props.theme.fontSizes.body};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
  }
  
  #root {
    height: 100%;
  }
  
  a {
    text-decoration: none;
    color: ${props => props.theme.colors.primary};
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.heading};
    margin-bottom: 0.5em;
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
  
  button {
    cursor: pointer;
  }
  
  /* React Calendar 사용자 정의 스타일 */
  .react-calendar {
    width: 100%;
    max-width: 100%;
    border: none;
    font-family: ${props => props.theme.fonts.body};
  }
  
  .react-calendar__tile--active {
    background: ${props => props.theme.colors.primary} !important;
    color: white;
  }
  
  .react-calendar__tile--now {
    background: ${props => props.theme.colors.primaryLight} !important;
  }
`;

export default GlobalStyle;