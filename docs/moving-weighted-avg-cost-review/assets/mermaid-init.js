(function () {
  if (typeof mermaid === 'undefined') return;
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { curve: 'basis', padding: 12, useMaxWidth: true },
    themeVariables: {
      fontFamily: '"PingFang SC","Microsoft YaHei",Arial,sans-serif',
      fontSize: '13px',
      primaryColor: '#eaf2ff',
      primaryBorderColor: '#c6e2ff',
      primaryTextColor: '#1b2430',
      lineColor: '#c3cede',
      secondaryColor: '#f6f8fb',
      tertiaryColor: '#ffffff'
    }
  });
})();
