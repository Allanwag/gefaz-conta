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
4. O operador pode enviar o resumo pelo WhatsApp normalmente ou tocar em **Enviar relatório ao gestor** para compartilhar o arquivo completo.
5. Para receber o resumo do WhatsApp, copie o texto inteiro e use **Relatório → Atualizar com relatório copiado**. Também continua disponível a importação do arquivo completo. Um novo texto do mesmo operador e período substitui a importação textual anterior.

> Enquanto não houver nuvem, guarde os backups: os dados vivem no aparelho.

## Revisão v17

- A contagem agora pode ser atualizada colando o resumo textual enviado pelo WhatsApp.
- O app valida período, operador e totais por talhão, origem, passada e máquina antes de importar.
- Como o resumo não detalha cada dia nem cruza máquina com talhão, os registros são identificados como consolidados e usam a data final do período; os totais de cada dimensão são preservados.
- Reimportar o texto do mesmo operador e período substitui a versão anterior, sem duplicar carretas.

## Revisão v16

- O relatório agora pode ser enviado ao gestor como um arquivo de consolidação do período selecionado.
- O gestor pode receber esse arquivo diretamente na tela de Relatório e atualizar a própria contagem sem duplicar lançamentos.

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
