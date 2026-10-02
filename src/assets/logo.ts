// Logo vetorizada da marca "Gifts da Mirlla" (Fotoímãs Personalizados)
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&amp;family=Shrikhand&amp;display=swap');
      .logo-circle { fill: #07402A; }
      .logo-gifts {
        font-family: 'Shrikhand', 'Fredoka', cursive, serif;
        font-size: 110px;
        fill: #F59BC1;
        letter-spacing: -2px;
      }
      .logo-mirlla {
        font-family: 'Shrikhand', 'Fredoka', cursive, serif;
        font-size: 88px;
        fill: #FBF7F1;
        letter-spacing: -1px;
      }
      .logo-sub {
        font-family: 'Fredoka', sans-serif;
        font-size: 20px;
        font-weight: 700;
        fill: #F59BC1;
        letter-spacing: 5px;
      }
      .flower-petal { fill: #F59BC1; }
      .flower-core { fill: #07402A; }
    </style>
  </defs>

  <!-- Fundo Circular Verde Escuro -->
  <circle cx="250" cy="250" r="250" class="logo-circle" />

  <!-- Flor decorativa sobre a letra 'i' de Gifts -->
  <g transform="translate(193, 142)">
    <circle cx="0" cy="-14" r="9" class="flower-petal" />
    <circle cx="13" cy="-4" r="9" class="flower-petal" />
    <circle cx="8" cy="11" r="9" class="flower-petal" />
    <circle cx="-8" cy="11" r="9" class="flower-petal" />
    <circle cx="-13" cy="-4" r="9" class="flower-petal" />
    <circle cx="0" cy="0" r="6" class="flower-core" />
  </g>

  <!-- Texto Gifts -->
  <text x="250" y="240" text-anchor="middle" class="logo-gifts">Gifts</text>

  <!-- Texto da Mirlla -->
  <text x="250" y="325" text-anchor="middle" class="logo-mirlla">da Mirlla</text>

  <!-- Subtítulo Fotoímãs Personalizados -->
  <text x="250" y="372" text-anchor="middle" class="logo-sub">FOTOÍMÃS PERSONALIZADOS</text>
</svg>`;

// Codificação Base64 para uso standalone sem requisição externa
export const LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(LOGO_SVG)))}`;
