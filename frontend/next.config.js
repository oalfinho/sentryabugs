/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para servir arquivos estáticos corretamente
  assetPrefix: "",
  // Garantir que o CSS seja processado
  compiler: {
    styledComponents: true, // se você usa styled-components
  },
};

module.exports = nextConfig;
