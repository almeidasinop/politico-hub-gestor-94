Político Hub Gestor
<div>
<img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
<img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
</div>
<br>

Um sistema de gestão de contatos e demandas para gabinetes e mandatos políticos, projetado para otimizar a organização, o atendimento ao cidadão e a comunicação da equipe.

📑 Índice
Sobre o Projeto

✨ Funcionalidades

🚀 Tecnologias Utilizadas

🏁 Como Começar

Pré-requisitos

Instalação

🔧 Configuração

🤝 Contribuições

📄 Licença

📖 Sobre o Projeto
O Político Hub Gestor nasceu da necessidade de centralizar e gerenciar as diversas interações e demandas que um mandato político recebe diariamente. A plataforma atua como um CRM (Customer Relationship Management) focado no setor público, permitindo que a equipe do gabinete cadastre eleitores, registre solicitações, acompanhe o andamento de cada demanda e mantenha um histórico completo de interações.

O objetivo principal é aumentar a eficiência da equipe, melhorar a qualidade do atendimento ao cidadão e fornecer dados para uma tomada de decisão mais estratégica.

✨ Funcionalidades
Gestão de Contatos: Cadastro completo de eleitores e lideranças, com informações de contato, endereço e observações.

Registro de Demandas: Sistema para registrar as solicitações dos cidadãos, classificando-as por tipo e prioridade.

Acompanhamento de Status: Monitore o progresso de cada demanda, desde o recebimento até a sua conclusão.

Controle de Usuários: Gerenciamento de membros da equipe com diferentes níveis de acesso.

Dashboard Intuitivo: (Futura implementação) Painel com gráficos e indicadores chave sobre os atendimentos.

Busca Avançada: Encontre rapidamente contatos ou demandas utilizando filtros.

🚀 Tecnologias Utilizadas
O projeto foi construído utilizando as seguintes tecnologias:

Backend: PHP

Frontend: HTML, CSS, JavaScript

Banco de Dados: MySQL

Dependências PHP (via Composer):

coffeecode/router: Para o gerenciamento de rotas da aplicação.

Estilização: Framework Bootstrap (utilizado em algumas partes)

🏁 Como Começar
Siga estas instruções para obter uma cópia do projeto e executá-lo em sua máquina local para desenvolvimento e testes.

Pré-requisitos
Você precisará ter um ambiente de desenvolvimento PHP/MySQL configurado. Recomendamos o uso de ferramentas como:

XAMPP

WampServer

Laragon

Docker

E também o Composer para gerenciar as dependências do PHP.

Instalação
Clone o repositório:

git clone https://github.com/almeidasinop/politico-hub-gestor-94.git

Acesse o diretório do projeto:

cd politico-hub-gestor-94

Instale as dependências do PHP:

composer install

Configure o Banco de Dados:

Crie um novo banco de dados no seu servidor MySQL (ex: politico_hub).

Importe o arquivo .sql que está na pasta _docs do projeto para criar as tabelas e estruturas necessárias.

Configure as variáveis de ambiente:

O projeto parece utilizar um arquivo de configuração para a conexão com o banco de dados. Localize o arquivo de configuração (provavelmente em source/Config.php ou similar) e atualize com as suas credenciais do banco de dados (host, nome do banco, usuário e senha).

Inicie o servidor:

Aponte o seu servidor web (Apache, Nginx) para a pasta raiz do projeto.

Acesse o projeto pelo seu navegador (ex: http://localhost/politico-hub-gestor-94).

🔧 Configuração
O principal arquivo de configuração a ser ajustado é o que contém os dados de conexão com o banco de dados.

Exemplo (em source/Config.php ou similar):

define("DATA_LAYER_CONFIG", [
    "driver" => "mysql",
    "host" => "localhost", // ou o host do seu BD
    "port" => "3306",
    "dbname" => "seu_banco_de_dados", // altere aqui
    "username" => "seu_usuario", // altere aqui
    "passwd" => "sua_senha", // altere aqui
    "options" => [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_CASE => PDO::CASE_NATURAL
    ]
]);

🤝 Contribuições
Contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será muito apreciada.

Faça um Fork do projeto

Crie uma Branch para sua Feature (git checkout -b feature/AmazingFeature)

Faça o Commit de suas mudanças (git commit -m 'Add some AmazingFeature')

Faça o Push para a Branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📄 Licença
Este projeto não possui uma licença definida. Recomenda-se adicionar um arquivo LICENSE para informar aos outros desenvolvedores como eles podem utilizar, modificar e distribuir o código.