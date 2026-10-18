import { createGlobalStyle } from 'styled-components';
import Pricedown from 'fonts/pricedown.ttf';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=Fira+Mono:wght@400;500&display=swap');

  @font-face {
    font-family: 'Pricedown';
    src: url(${Pricedown});
  }
`;

export default GlobalStyle;
