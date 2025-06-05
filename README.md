# Gerenciador de Produtos

Este é um aplicativo web simples e otimizado para dispositivos móveis, desenvolvido em HTML, CSS (com Tailwind CSS) e JavaScript puro. Ele foi projetado para ajudar vendedores iniciantes a gerenciar e consultar o preço de produtos em uma empresa que comercializa itens de padaria, delicatessen e produtos de mercado em geral.

## Funcionalidades

- Consulta de Produtos: Permite buscar produtos por nome, categoria e detalhes. A lista de produtos é exibida em ordem alfabética para facilitar a localização.

- Cadastro e Edição: Adicione novos produtos ou atualize informações de produtos existentes, incluindo nome, categoria, marca, detalhes, medida e preço.

- Exclusão de Produtos: Remova produtos do sistema após confirmação.

- Persistência de Dados: Todos os dados são armazenados localmente no `localStorage` do navegador, garantindo que suas informações não sejam perdidas ao fechar a aplicação.

- Importação e Exportação de Dados:
  - Exportar: Salve todos os seus dados em um arquivo JSON para backup ou para transferir para outro dispositivo.
  - Importar: Carregue dados de um arquivo JSON. Os produtos importados são mesclados com os dados existentes, atualizando produtos com o mesmo nome e adicionando novos.

- Dados de Demonstração: Inclui a opção de carregar um conjunto de dados de demonstração a partir de um arquivo JSON externo (`/data/demo_products.json`).

- Botão "Voltar ao Topo": Um botão flutuante aparece no canto inferior direito da tela quando a lista de produtos é longa, permitindo uma rolagem rápida para o início da página.

- Design Responsivo: A interface é otimizada para funcionar bem em diversos tamanhos de tela, desde smartphones até desktops.

## Estrutura do Projeto

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── data/
    └── demo_products.json
```

- `index.html`: O arquivo HTML principal que estrutura a aplicação e vincula os arquivos CSS e JavaScript.

- `css/style.css`: Contém os estilos personalizados para a aplicação, complementando o Tailwind CSS.

- `js/script.js`: Contém toda a lógica JavaScript da aplicação, incluindo gerenciamento de dados, manipulação do DOM e eventos.

- `data/demo_products.json`: Um arquivo JSON externo que armazena os dados de demonstração que podem ser carregados na aplicação.

## Como Usar

1. Clone o Repositório:
    ```sh
    git clone <URL_DO_SEU_REPOSITORIO>
    cd gerenciador-de-produtos # Ou o nome da sua pasta
    ```
2. Abra no Navegador:
Basta abrir o arquivo `index.html` diretamente no seu navegador web. Não é necessário um servidor web para executar esta aplicação, pois ela utiliza apenas recursos do navegador e `localStorage`.

### Primeiro Acesso

Na primeira vez que você abrir a aplicação, se não houver dados salvos no seu `localStorage`, ela tentará carregar os dados de demonstração a partir do arquivo `data/demo_products.json`.

## Tecnologias Utilizadas

- **HTML5**: Estrutura fundamental da aplicação.
- **CSS3**: Estilização e responsividade.
- **Tailwind CSS**: Framework CSS utility-first para um desenvolvimento rápido e responsivo da interface.
- **JavaScript (ES6+)**: Lógica principal da aplicação, manipulação de dados, persistência no localStorage e interatividade.

## Contribuição

Contribuições são bem-vindas! Se você tiver sugestões de melhoria, novas funcionalidades ou encontrar algum bug, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.