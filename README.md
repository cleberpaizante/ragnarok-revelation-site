# Ragnarok Revelation

Site do **Ragnarok Revelation**, uma homenagem ao universo de Rune-Midgard. A página apresenta o projeto, sua identidade visual e uma cinemática em vídeo.

🌐 **Acesse o site:** [ragnarok-revelation-site.vercel.app](https://ragnarok-revelation-site.vercel.app)

## Sobre o projeto

O site é uma experiência estática feita com HTML, CSS e JavaScript, com vídeos e imagens locais. Ele inclui:

- Página inicial responsiva com vídeo de fundo.
- Pausa de 10 segundos na imagem final tratada, ajustada para preencher a tela, antes de reiniciar o vídeo de fundo. A imagem `assets/ending-frame.png` foi extraída aos 106 segundos de `assets/background.mp4`; se o vídeo for alterado, atualize também a imagem e os tempos em `audio-toggle.js`.
- Controles de áudio e volume.
- Página para assistir à cinemática completa.
- Apresentação da história e da identidade de Ragnarok Revelation.
- Prévia de formulário de cadastro.

> **Importante:** o cadastro ainda não envia nem salva dados. As opções de entrar, baixar o jogo, acessar o Discord e consultar o status do servidor também não estão conectadas e aparecem como demonstração ou “em breve”.

## Executar localmente

Para testar localmente com suporte ao avanço da cinemática, execute na pasta do projeto:

```powershell
py preview_server.py
```

Depois, acesse [http://localhost:8000](http://localhost:8000).

## Publicação

O projeto está hospedado no Vercel e conectado ao repositório do GitHub. Novos envios para a branch `master` podem gerar uma nova publicação automaticamente.

## Tecnologias

- HTML
- CSS
- JavaScript
- Vercel

## Aviso

Projeto de fã, sem afiliação ou endosso oficial da Gravity ou dos responsáveis por Ragnarok Online. Marcas e propriedades intelectuais de terceiros pertencem aos respectivos titulares.
