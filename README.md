# Gefaz Conta — Carretas de Café

App simples para contar carretas de café colhidas **de árvore** e **de chão**, por talhão.
Derivado do Gefaz360, para uso em campo por você e os operadores.

- Funciona **offline** (PWA instalável no celular).
- Cada aparelho guarda seus próprios dados (localStorage).
- Consolidação entre operadores por **exportar/importar** (o app soma sem duplicar).

## Como publicar no GitHub Pages

1. Crie um repositório novo (ex.: `gefaz-conta`) na sua conta.
2. Suba todos estes arquivos na raiz do repositório:
   `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`.
3. No repositório: **Settings → Pages → Branch: `main` / `/root` → Save**.
4. Em ~1 minuto o app estará em `https://SEU-USUARIO.github.io/gefaz-conta/`.

Pelo terminal, dentro desta pasta:

```bash
git init
git add .
git commit -m "Gefaz Conta - contagem de carretas de cafe"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/gefaz-conta.git
git push -u origin main
```

## Como os 3 usam

1. Cada um abre o link no celular e **instala** (Chrome/Android: menu → "Instalar app"; Safari/iPhone: compartilhar → "Adicionar à Tela de Início").
2. No primeiro uso, cada um **digita seu nome** (operador).
3. Escolhe o talhão e toca **+1 / +½** em Árvore ou Chão a cada carreta. O **−1** corrige.
4. No fim do dia, cada operador vai em **Dados → Exportar meus dados** e te envia o arquivo `.json` (WhatsApp/e-mail).
5. Você importa os arquivos em **Dados → Importar / juntar** — a contagem dos três aparelhos vira um total só, sem duplicar. Depois **Relatório → Enviar resumo pelo WhatsApp** ou **Baixar CSV**.

> Enquanto não houver nuvem, guarde os backups: os dados vivem no aparelho.
