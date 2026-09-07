# Gefaz Conta — Carretas de Café

App simples para contar carretas de café colhidas **de árvore** e **de chão**, por talhão.
Derivado do Gefaz360, para uso em campo por você e os operadores.

- Funciona **offline** (PWA instalável no celular).
- Cada aparelho guarda seus próprios dados (localStorage).
- Consolidação entre operadores por **exportar/importar** (o app soma sem duplicar).

## Como publicar no GitHub Pages

O repositório local já está pronto (git iniciado, arquivos commitados, remote
apontando para `https://github.com/allanwag/gefaz-conta.git`). Falta só:

1. Crie o repositório vazio **`gefaz-conta`** na sua conta GitHub (allanwag) —
   não marque nenhuma opção de inicializar com README/licença.
2. No terminal, dentro da pasta `Documents\gefaz-conta`:
   ```bash
   git push -u origin main
   ```
   (o Windows deve abrir a janela de login do GitHub na primeira vez).
3. No repositório: **Settings → Pages → Branch: `main` / `/(root)` → Save**.
4. Em ~1 minuto o app estará em `https://allanwag.github.io/gefaz-conta/`.

## Como os 3 usam

1. Cada um abre o link no celular e **instala** (Chrome/Android: menu → "Instalar app"; Safari/iPhone: compartilhar → "Adicionar à Tela de Início").
2. No primeiro uso, cada um **digita seu nome** (operador).
3. Escolhe o talhão e toca **+1 / +½** em Árvore ou Chão a cada carreta. O **−1** corrige.
4. No fim do dia, cada operador vai em **Dados → Exportar meus dados** e te envia o arquivo `.json` (WhatsApp/e-mail).
5. Você importa os arquivos em **Dados → Importar / juntar** — a contagem dos três aparelhos vira um total só, sem duplicar. Depois **Relatório → Enviar resumo pelo WhatsApp** ou **Baixar CSV**.

> Enquanto não houver nuvem, guarde os backups: os dados vivem no aparelho.

## Revisão v15

- Backups incluem revisões dos registros e IDs excluídos. Reimportar um backup antigo não desfaz correções nem restaura lançamentos excluídos na v15.
- Todos os aparelhos devem usar v15 para transmitir correções/exclusões. Backups v1 antigos com registros válidos continuam aceitos; exclusões feitas antes da v15 não podem ser recuperadas do histórico.
- Exclusões prevalecem sobre edições. Edições simultâneas usam a maior revisão e um desempate determinístico; não são somadas. Confira os totais se duas pessoas corrigirem o mesmo lançamento.
- Arquivos inválidos são rejeitados integralmente, sem importação parcial. Falhas de gravação revertem a alteração em memória e exibem aviso.
- Atualizações preservam o cache offline. Uma instalação incompleta não substitui a versão anterior, e caches de outros apps são preservados.
- CSV protege células contra interpretação como fórmulas; zoom do navegador está habilitado.

### Testes

Com Node.js 22 ou superior, execute na pasta do projeto:

```sh
node --test tests/*.test.cjs
```

Os testes não exigem instalação de dependências. Para testar a interface no Windows, execute `pwsh -File ./serve.ps1` e abra `http://localhost:8124/`.

Antes de publicar, valide em celular: instalar, lançar +1/+½, corrigir com −1, exportar/importar entre dois aparelhos, fechar e reabrir sem rede e atualizar quando a conexão retornar.
