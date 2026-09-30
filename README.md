# Passo a passo

Organize o hoje. Um passo de cada vez.

O **Passo a passo** é um organizador de tarefas leve, responsivo e inteiramente executado no navegador. Crie uma lista, acompanhe seu progresso e mantenha suas tarefas no próprio dispositivo, sem cadastro ou backend.

## Recursos

- Criação de tarefas com prazo e prioridade baixa, média ou alta.
- Sinalização de tarefas com prazo para hoje ou atrasado.
- Marcação, remoção e limpeza de tarefas concluídas.
- Filtros para ver todas as tarefas, as que estão em aberto ou as concluídas.
- Busca por título, contadores e indicador de progresso.
- Modo claro e noturno, com preferência salva no navegador. Na primeira visita, o tema segue a preferência do sistema.
- Interface adaptável a celulares e desktops, navegação por teclado e suporte à preferência por movimento reduzido.

## Como executar

O projeto não exige instalação de pacotes nem etapa de compilação. Para executar localmente, inicie um servidor na pasta do projeto:

```bash
python3 -m http.server 8000
```

Abra [http://localhost:8000](http://localhost:8000) no navegador. Também é possível iniciar um servidor local com a extensão Live Server do VS Code.

Servir a página por HTTP evita diferenças entre navegadores ao usar o armazenamento local. As fontes DM Sans e Manrope são carregadas pelo Google Fonts; sem acesso à internet, o site usa fontes alternativas.

## Uso

1. Digite o nome da tarefa e, se desejar, defina um prazo e uma prioridade.
2. Selecione **Adicionar** para incluí-la na lista.
3. Marque a caixa da tarefa para concluí-la. Use **Remover** para excluí-la ou **Limpar concluídas** para remover todas as tarefas finalizadas.
4. Use os filtros e a busca para encontrar tarefas. Pressione `/` para focar a busca e `Esc` para limpar o termo enquanto ela estiver em foco.
5. Use o botão de lua ou de sol no cabeçalho para alternar entre os temas.

## Dados e privacidade

As tarefas e a preferência de tema são guardadas no `localStorage` do navegador. Os dados ficam associados ao navegador e à origem local do site: não são enviados a um servidor nem sincronizados entre dispositivos. Limpar os dados do navegador pode apagá-los.

## Estrutura do projeto

```text
.
├── index.html   # estrutura e conteúdo da página
├── styles.css   # apresentação, temas e layout responsivo
├── script.js    # tarefas, filtros, busca e preferências
└── README.md    # documentação do projeto
```

## Tecnologias

- HTML5
- CSS3
- JavaScript moderno, sem bibliotecas externas

Para conferir a sintaxe do JavaScript, use `node --check script.js`. O Node.js não é necessário para executar o site.