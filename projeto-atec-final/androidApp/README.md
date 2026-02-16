# ATEC HQ Mobile App

Esta é a aplicação móvel complementar à plataforma Web ATEC HeadQuarter, desenvolvida para Android utilizando **Kotlin** e **Jetpack Compose**.

## Funcionalidades

A aplicação permite aos utilizadores (Formadores):
- Consultar Horários
- Visualizar Avaliações
- Receber notificações (se implementado)
- Aceder a informações pessoais

## Tecnologias

- **Linguagem:** Kotlin
- **UI Framework:** Jetpack Compose (Material Design 3)
- **Navegação:** AndroidX Navigation Compose
- **Networking:** Retrofit + GSON
- **SDK Mínimo:** Android 7.1 (API 25)
- **SDK Alvo:** Android 15 (API 36)

## Como Executar

### Pré-requisitos
- **Android Studio** (Recomendado: Koala ou Ladybug)
- **JDK 17** ou superior

### Passos
1. **Abrir o Projeto**
   - Abra o Android Studio e selecione "Open".
   - Navegue até à pasta `androidApp` deste repositório e clique em OK.

2. **Sincronizar Gradle**
   - Aguarde que o Android Studio descarregue as dependências e indexe o projeto.
   - Se solicitado, atualize o plugin do Gradle.

3. **Configurar API**
   - A aplicação móvel precisa de comunicar com o Backend.
   - Certifique-se que o Backend está a correr.
   - **Nota Importante:** Se estiver a testar num Emulador Android, o endereço `localhost` do computador é acessível via `http://10.0.2.2:5000`. Verifique as configurações do Retrofit no código (normalmente em `network/ExemploApi.kt` ou similar) se precisar de ajustar o IP para um dispositivo físico.

4. **Executar**
   - Selecione um emulador ou conecte um dispositivo físico via USB.
   - Clique no botão "Run".

## Estrutura do Projeto

- `app/src/main/java/pt/atec/atec_hq_mobile`: Código fonte Kotlin
  - `ui/`: Ecrãs e componentes visuais (Compose)
  - `network/`: Configuração da API (Retrofit)
  - `data/`: Modelos de dados
- `app/src/main/res`: Recursos (Imagens, Strings, Ícones)

## Credenciais de Teste
- **Admin:** `admin@gmail.com` / `123` 
- **Formador:** `formador@gmail.com` / `123`

Desenvolvido por **Hugo Bacalhau** e **Tiago Rosa**.
