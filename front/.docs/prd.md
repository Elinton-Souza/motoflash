# PRD — Frontend MotoFlash

## 1. Visão geral do produto

O **MotoFlash** é uma plataforma web para conectar **restaurantes** e **motoboys**, permitindo que restaurantes solicitem entregadores disponíveis e que motoboys acompanhem solicitações, entregas, histórico e ganhos.

Nesta primeira versão, o foco será desenvolver o **frontend navegável**, sem necessidade de backend completo inicialmente. O objetivo é permitir o teste do fluxo do sistema como:

**Motoboy**
e
**Dono/Gerente de Restaurante**

---

# 2. Objetivo deste PRD

Criar as telas do frontend do MotoFlash para validar:

* navegação entre telas;
* fluxo do motoboy;
* fluxo do restaurante;
* organização das informações;
* usabilidade do sistema;
* experiência visual minimalista;
* estrutura inicial para futura integração com backend.

---

# 3. Tecnologias do frontend

| Tecnologia           | Uso                              |
| -------------------- | -------------------------------- |
| **React**            | Construção da interface          |
| **TypeScript**       | Tipagem e organização do código  |
| **Tailwind CSS**     | Estilização rápida e minimalista |
| **React Router DOM** | Navegação entre telas            |
| **Lucide React**     | Ícones minimalistas              |
| **Mock Data**        | Simular dados antes do backend   |

---

# 4. Objetivo do MVP visual

O frontend deve permitir que o usuário teste dois caminhos principais:

## Caminho 1 — Motoboy

```text
Login
 ↓
Selecionar perfil: Motoboy
 ↓
Dashboard do Motoboy
 ↓
Nova solicitação
 ↓
Aceitar entrega
 ↓
Entrega em andamento
 ↓
Finalizar entrega
 ↓
Histórico / Financeiro
```

## Caminho 2 — Restaurante

```text
Login
 ↓
Selecionar perfil: Restaurante
 ↓
Dashboard do Restaurante
 ↓
Nova entrega
 ↓
Solicitar motoboy
 ↓
Acompanhamento da entrega
 ↓
Histórico / Financeiro
```

---

# 5. Perfis de usuário

## 5.1 Motoboy

Usuário que recebe solicitações de entrega, aceita ou recusa corridas, acompanha a rota, finaliza entregas e consulta ganhos.

### Necessidades principais

* Ver entregas disponíveis.
* Aceitar ou recusar solicitações.
* Acompanhar entrega em andamento.
* Consultar ganhos do dia.
* Consultar histórico financeiro.

---

## 5.2 Dono/Gerente de Restaurante

Usuário responsável por criar pedidos, solicitar motoboys, acompanhar entregas e verificar custos.

### Necessidades principais

* Criar uma nova entrega.
* Encontrar motoboys disponíveis.
* Acompanhar status da entrega.
* Consultar histórico de pedidos.
* Ver custos com entregas.

---

# 6. Escopo do frontend

## Dentro do escopo

* Tela de login.
* Tela de escolha de perfil.
* Dashboard do motoboy.
* Nova solicitação para motoboy.
* Tela de entrega em andamento.
* Histórico/financeiro do motoboy.
* Dashboard do restaurante.
* Tela de nova entrega.
* Tela de acompanhamento da entrega.
* Histórico/financeiro do restaurante.
* Navegação funcional entre telas.
* Layout desktop.
* Dados simulados.

## Fora do escopo neste primeiro momento

* Backend real.
* Login real com autenticação.
* Banco de dados.
* Integração com Prisma.
* Integração real com mapas.
* Pagamento.
* Notificações reais.
* Chat em tempo real.

---

# 7. Requisitos funcionais do frontend

## RF01 — Login visual

O usuário deve conseguir acessar uma tela de login e seguir para o sistema.

### Campos

* E-mail ou telefone.
* Senha.
* Botão entrar.

### Comportamento esperado

Ao clicar em **Entrar**, o sistema deve direcionar para a tela de seleção de perfil.

---

## RF02 — Seleção de perfil

O sistema deve permitir escolher entre:

* Entrar como **Motoboy**.
* Entrar como **Restaurante**.

### Comportamento esperado

Ao selecionar um perfil, o usuário é redirecionado para o dashboard correspondente.

---

## RF03 — Dashboard do Motoboy

O motoboy deve visualizar um resumo do seu dia.

### Informações exibidas

* Ganhos do dia.
* Entregas realizadas.
* Despesas.
* Saldo.
* Status online/offline.
* Próxima entrega ou solicitação disponível.
* Menu lateral.

### Ações disponíveis

* Ver nova solicitação.
* Ver entregas.
* Ver financeiro.
* Acessar perfil.

---

## RF04 — Nova solicitação do Motoboy

O motoboy deve visualizar os detalhes de uma entrega recebida.

### Informações exibidas

* Nome do restaurante.
* Endereço de retirada.
* Endereço de entrega.
* Valor da entrega.
* Distância estimada.
* Tempo estimado.
* Botão **Aceitar**.
* Botão **Recusar**.

### Comportamento esperado

* Ao clicar em **Aceitar**, ir para a tela de entrega em andamento.
* Ao clicar em **Recusar**, voltar para o dashboard.

---

## RF05 — Entrega em andamento do Motoboy

O motoboy deve acompanhar a entrega ativa.

### Informações exibidas

* Restaurante.
* Cliente.
* Endereço de entrega.
* Código de entrega.
* Status da entrega.
* Área visual simulando mapa.
* Botão **Finalizar entrega**.

### Status exibidos

```text
Retirada confirmada
 ↓
A caminho do cliente
 ↓
Entregar pedido
 ↓
Finalizar entrega
```

### Comportamento esperado

Ao clicar em **Finalizar entrega**, o usuário deve ir para o histórico/financeiro.

---

## RF06 — Histórico/Financeiro do Motoboy

O motoboy deve consultar entregas realizadas e resumo financeiro.

### Informações exibidas

* Total de ganhos.
* Total de entregas.
* Total de despesas.
* Saldo do período.
* Lista de entregas.
* Filtros visuais.

---

## RF07 — Dashboard do Restaurante

O restaurante deve visualizar um resumo da operação.

### Informações exibidas

* Pedidos de hoje.
* Entregas em andamento.
* Motoboys disponíveis.
* Custo com entregas.
* Lista de pedidos recentes.
* Menu lateral.

### Ações disponíveis

* Criar nova entrega.
* Ver acompanhamento.
* Ver histórico/financeiro.

---

## RF08 — Nova Entrega / Solicitar Motoboy

O restaurante deve conseguir preencher os dados de uma entrega.

### Campos

* Nome do cliente.
* Telefone.
* Endereço de coleta.
* Endereço de entrega.
* Referência.
* Valor da entrega.

### Área lateral

* Lista de motoboys próximos.
* Status do motoboy.
* Distância.
* Botão selecionar.
* Mapa simulado da região.

### Comportamento esperado

Ao clicar em **Solicitar Motoboy**, ir para a tela de acompanhamento.

---

## RF09 — Acompanhamento da Entrega

O restaurante deve acompanhar o andamento da entrega.

### Informações exibidas

* Número do pedido.
* Dados do cliente.
* Dados do motoboy.
* Código de entrega.
* Status da entrega.
* Mapa simulado.
* Botão para voltar.

### Status exibidos

```text
Pedido confirmado
 ↓
Motoboy a caminho da coleta
 ↓
Coletou pedido
 ↓
A caminho do cliente
 ↓
Entregue
```

---

## RF10 — Histórico/Financeiro do Restaurante

O restaurante deve visualizar dados de entregas e custos.

### Informações exibidas

* Total de entregas.
* Entregas concluídas.
* Entregas canceladas.
* Custo total com entregas.
* Gráfico simples de entregas por dia.
* Gráfico simples de custos.
* Lista de entregas.

---

# 8. Mapa de rotas

## Rotas públicas

```text
/
```

Tela de login.

```text
/select-profile
```

Tela para escolher o tipo de usuário.

---

## Rotas do Motoboy

```text
/motoboy/dashboard
```

Dashboard do motoboy.

```text
/motoboy/request
```

Nova solicitação de entrega.

```text
/motoboy/delivery
```

Entrega em andamento.

```text
/motoboy/finance
```

Histórico e financeiro.

```text
/motoboy/profile
```

Perfil do motoboy.

---

## Rotas do Restaurante

```text
/restaurant/dashboard
```

Dashboard do restaurante.

```text
/restaurant/new-delivery
```

Nova entrega / solicitar motoboy.

```text
/restaurant/tracking
```

Acompanhamento da entrega.

```text
/restaurant/finance
```

Histórico e financeiro.

```text
/restaurant/settings
```

Configurações do restaurante.

---

# 9. Estrutura recomendada de pastas

```text
frontend/
│
├── src/
│   ├── assets/
│   │   ├── logo/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── MetricCard.tsx
│   │   └── MapMock.tsx
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── MotoboyLayout.tsx
│   │   └── RestaurantLayout.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── SelectProfile.tsx
│   │   │
│   │   ├── motoboy/
│   │   │   ├── MotoboyDashboard.tsx
│   │   │   ├── DeliveryRequest.tsx
│   │   │   ├── DeliveryInProgress.tsx
│   │   │   ├── MotoboyFinance.tsx
│   │   │   └── MotoboyProfile.tsx
│   │   │
│   │   └── restaurant/
│   │       ├── RestaurantDashboard.tsx
│   │       ├── NewDelivery.tsx
│   │       ├── DeliveryTracking.tsx
│   │       ├── RestaurantFinance.tsx
│   │       └── RestaurantSettings.tsx
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx
│   │
│   ├── data/
│   │   ├── motoboyMock.ts
│   │   ├── restaurantMock.ts
│   │   └── deliveriesMock.ts
│   │
│   ├── types/
│   │   ├── User.ts
│   │   ├── Delivery.ts
│   │   ├── Restaurant.ts
│   │   └── Motoboy.ts
│   │
│   ├── App.tsx
│   └── main.tsx
```

---

# 10. Design system do MotoFlash

## Estilo visual

O sistema deve seguir uma interface:

* minimalista;
* limpa;
* clara;
* funcional;
* profissional;
* com bastante espaço em branco;
* com foco em leitura rápida.

---

## Cores principais

| Uso              | Cor       |
| ---------------- | --------- |
| Primária         | `#FF3B1F` |
| Primária escura  | `#D92D16` |
| Fundo principal  | `#F8FAFC` |
| Cards            | `#FFFFFF` |
| Texto principal  | `#111827` |
| Texto secundário | `#6B7280` |
| Borda            | `#E5E7EB` |
| Sucesso          | `#22C55E` |
| Alerta           | `#F59E0B` |
| Erro             | `#EF4444` |

---

## Tipografia

Sugestão:

```text
Inter
```

ou

```text
Poppins
```

### Hierarquia

| Elemento         | Tamanho |
| ---------------- | ------- |
| Título principal | 28px    |
| Título de seção  | 22px    |
| Subtítulo        | 16px    |
| Texto comum      | 14px    |
| Texto auxiliar   | 12px    |

---

## Componentes principais

### Sidebar

Usada tanto no painel do motoboy quanto no painel do restaurante.

Itens do motoboy:

```text
Dashboard
Nova Solicitação
Entregas
Financeiro
Perfil
Sair
```

Itens do restaurante:

```text
Dashboard
Nova Entrega
Acompanhamento
Histórico / Financeiro
Configurações
Sair
```

---

### Header

Deve conter:

* título da página;
* ícone de notificações;
* nome do usuário;
* avatar.

---

### MetricCard

Card para números principais.

Exemplo:

```text
Ganhos hoje
R$ 120,00
```

---

### StatusBadge

Indica status como:

```text
Online
Disponível
Em entrega
Concluída
Cancelada
Aguardando
```

---

### MapMock

Um componente visual simulando mapa.

Não precisa usar API real no começo. Pode ser uma caixa com linhas, pontos e rota simulada.

---

# 11. Fluxo de navegação detalhado

## 11.1 Fluxo do Motoboy

### Etapa 1 — Login

Rota:

```text
/
```

Ação:

```text
Entrar
```

Destino:

```text
/select-profile
```

---

### Etapa 2 — Escolher Motoboy

Rota:

```text
/select-profile
```

Ação:

```text
Entrar como Motoboy
```

Destino:

```text
/motoboy/dashboard
```

---

### Etapa 3 — Dashboard do Motoboy

Rota:

```text
/motoboy/dashboard
```

Ação principal:

```text
Ver nova solicitação
```

Destino:

```text
/motoboy/request
```

---

### Etapa 4 — Nova Solicitação

Rota:

```text
/motoboy/request
```

Ações:

```text
Aceitar
```

Destino:

```text
/motoboy/delivery
```

```text
Recusar
```

Destino:

```text
/motoboy/dashboard
```

---

### Etapa 5 — Entrega em andamento

Rota:

```text
/motoboy/delivery
```

Ação:

```text
Finalizar entrega
```

Destino:

```text
/motoboy/finance
```

---

### Etapa 6 — Histórico / Financeiro

Rota:

```text
/motoboy/finance
```

Ação:

```text
Voltar ao Dashboard
```

Destino:

```text
/motoboy/dashboard
```

---

## 11.2 Fluxo do Restaurante

### Etapa 1 — Login

Rota:

```text
/
```

Ação:

```text
Entrar
```

Destino:

```text
/select-profile
```

---

### Etapa 2 — Escolher Restaurante

Rota:

```text
/select-profile
```

Ação:

```text
Entrar como Restaurante
```

Destino:

```text
/restaurant/dashboard
```

---

### Etapa 3 — Dashboard do Restaurante

Rota:

```text
/restaurant/dashboard
```

Ação principal:

```text
Nova entrega
```

Destino:

```text
/restaurant/new-delivery
```

---

### Etapa 4 — Nova Entrega

Rota:

```text
/restaurant/new-delivery
```

Ação:

```text
Solicitar Motoboy
```

Destino:

```text
/restaurant/tracking
```

---

### Etapa 5 — Acompanhamento

Rota:

```text
/restaurant/tracking
```

Ações:

```text
Ver histórico / financeiro
```

Destino:

```text
/restaurant/finance
```

```text
Voltar ao dashboard
```

Destino:

```text
/restaurant/dashboard
```

---

### Etapa 6 — Histórico / Financeiro

Rota:

```text
/restaurant/finance
```

Ação:

```text
Voltar ao Dashboard
```

Destino:

```text
/restaurant/dashboard
```

---

# 12. Conteúdo das telas

## 12.1 Tela de Login

### Objetivo

Permitir entrada no sistema.

### Layout

* Logo MotoFlash centralizada.
* Texto curto de apresentação.
* Campo e-mail ou telefone.
* Campo senha.
* Botão entrar.
* Link “Criar conta”.
* Link “Esqueci minha senha”.

### Estados

* Campo vazio.
* Campo preenchido.
* Erro visual simples.
* Loading no botão.

---

## 12.2 Tela de Seleção de Perfil

### Objetivo

Permitir testar o sistema com diferentes perfis.

### Layout

Dois cards grandes:

```text
Sou Motoboy
```

```text
Sou Restaurante
```

Cada card deve ter:

* ícone;
* descrição curta;
* botão de entrada.

---

## 12.3 Dashboard do Motoboy

### Objetivo

Dar uma visão rápida do dia do motoboy.

### Cards principais

```text
Ganhos hoje
Entregas hoje
Despesas hoje
Saldo
```

### Áreas

* Próxima entrega.
* Ações rápidas.
* Status online.
* Menu lateral.

### CTA principal

```text
Ver nova solicitação
```

---

## 12.4 Nova Solicitação do Motoboy

### Objetivo

Permitir aceitar ou recusar entrega.

### Conteúdo

* Restaurante.
* Endereço de retirada.
* Endereço de destino.
* Valor da entrega.
* Distância.
* Tempo estimado.
* Temporizador visual.

### Botões

```text
Recusar
Aceitar
```

---

## 12.5 Entrega em Andamento

### Objetivo

Acompanhar a entrega ativa.

### Conteúdo

* Dados do restaurante.
* Dados do cliente.
* Código da entrega.
* Status da entrega.
* Mapa simulado.
* Botão finalizar.

### CTA principal

```text
Finalizar entrega
```

---

## 12.6 Histórico / Financeiro do Motoboy

### Objetivo

Exibir ganhos, despesas e entregas realizadas.

### Conteúdo

* Total de ganhos.
* Total de entregas.
* Total de despesas.
* Saldo.
* Tabela de entregas.
* Filtros por período e status.

---

## 12.7 Dashboard do Restaurante

### Objetivo

Apresentar visão geral da operação de entregas.

### Cards principais

```text
Pedidos hoje
Entregas em andamento
Motoboys disponíveis
Custo com entregas
```

### Conteúdo

* Lista de pedidos recentes.
* Status dos pedidos.
* Atalho para criar nova entrega.

---

## 12.8 Nova Entrega / Solicitar Motoboy

### Objetivo

Criar entrega e selecionar motoboy.

### Conteúdo

Formulário:

* cliente;
* telefone;
* endereço de coleta;
* endereço de entrega;
* referência;
* valor.

Painel lateral:

* motoboys próximos;
* distância;
* status;
* botão selecionar.

Mapa:

* restaurante;
* motoboys próximos.

### CTA principal

```text
Solicitar Motoboy
```

---

## 12.9 Acompanhamento da Entrega

### Objetivo

Permitir ao restaurante acompanhar o pedido em tempo real.

### Conteúdo

* cliente;
* motoboy;
* código de entrega;
* mapa simulado;
* status da entrega.

---

## 12.10 Histórico / Financeiro do Restaurante

### Objetivo

Mostrar controle financeiro e operacional.

### Conteúdo

* total de entregas;
* entregas concluídas;
* entregas canceladas;
* custo total;
* gráfico simples;
* tabela de entregas.

---

# 13. Dados mockados

## Motoboy

```ts
const motoboy = {
  name: "João Silva",
  status: "online",
  todayEarnings: 120,
  todayDeliveries: 8,
  todayExpenses: 30,
  balance: 90,
};
```

---

## Restaurante

```ts
const restaurant = {
  name: "Sabor & Cia",
  todayOrders: 24,
  activeDeliveries: 6,
  availableMotoboys: 8,
  deliveryCost: 85.5,
};
```

---

## Entrega

```ts
const delivery = {
  id: "#1023",
  restaurant: "Burger House",
  customer: "Maria Souza",
  pickupAddress: "Av. Paulista, 1000",
  deliveryAddress: "Rua Augusta, 1500",
  value: 12,
  distance: "2,5 km",
  estimatedTime: "12 min",
  status: "Em rota",
};
```

---

# 14. Critérios de aceite

## Login

* O usuário consegue clicar em entrar.
* O sistema redireciona para seleção de perfil.

## Seleção de perfil

* O usuário consegue escolher Motoboy.
* O usuário consegue escolher Restaurante.
* Cada opção leva ao dashboard correto.

## Motoboy

* O dashboard abre corretamente.
* A sidebar permite navegar entre telas.
* O usuário consegue abrir uma nova solicitação.
* O botão aceitar leva para entrega em andamento.
* O botão recusar volta ao dashboard.
* O botão finalizar entrega leva ao financeiro.

## Restaurante

* O dashboard abre corretamente.
* A sidebar permite navegar entre telas.
* O usuário consegue abrir nova entrega.
* O botão solicitar motoboy leva para acompanhamento.
* O histórico/financeiro abre corretamente.

## Design

* As telas devem ser minimalistas.
* Deve haver consistência visual.
* Os botões principais devem usar a cor da marca.
* As telas devem ser organizadas para desktop.
* O usuário deve entender o fluxo sem explicação externa.

---

# 15. Prioridade de desenvolvimento

## Prioridade 1

```text
Login
Seleção de perfil
Layout base
Sidebar
Header
Dashboard Motoboy
Dashboard Restaurante
```

## Prioridade 2

```text
Nova solicitação do motoboy
Entrega em andamento
Nova entrega do restaurante
Acompanhamento da entrega
```

## Prioridade 3

```text
Histórico / Financeiro Motoboy
Histórico / Financeiro Restaurante
Filtros
Tabelas
Mock de mapa
```

## Prioridade 4

```text
Perfil
Configurações
Estados de loading
Estados vazios
Responsividade avançada
```

---

# 16. Resultado esperado

Ao final do desenvolvimento do frontend, deve ser possível apresentar o MotoFlash como um protótipo navegável de site desktop, permitindo testar os dois fluxos principais:

## Fluxo do Motoboy

```text
Login → Motoboy → Dashboard → Nova Solicitação → Aceitar → Entrega em Andamento → Finalizar → Financeiro
```

## Fluxo do Restaurante

```text
Login → Restaurante → Dashboard → Nova Entrega → Solicitar Motoboy → Acompanhamento → Histórico / Financeiro
```

O objetivo é que o sistema já pareça uma plataforma real, mesmo usando dados simulados, deixando a estrutura pronta para futura integração com backend, Prisma ORM e banco PostgreSQL.
