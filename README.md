# Decision Hub

<div align="center">
  <img src="./public/decihub.svg" alt="DecisionHub Logo" width="200" />
  <h3 align="center">Sistem Pendukung Keputusan Berbasis Web</h3>

  <p align="center">
    Platform kolaboratif untuk membantu menganalisis keputusan 
    <br />
    <a href="http://decihub.hadinm.my.id">Live Demo</a>
    ·
    <a href="https://github.com/Antsistra/DecisionHub/issues">Report Bug</a>
    ·
    <a href="https://github.com/Antsistra/DecisionHub/issues">Request Feature</a>
  </p>
</div>

## Tentang Decision Hub

Decision Hub adalah aplikasi sistem pendukung keputusan (SPK) berbasis web yang membantu pengguna dalam membuat keputusan komplek menggunakan metode **Profile Matching** dan **Weighted Product**. Aplikasi ini cocok untuk berbagai pengambilan keputusan seperti pemilihan karyawan, pemilihan supplier, pemilihan lokasi, dan banyak skenario keputusan lainnya.

## Application Demo

<div align="center">
  <img src="./public/decihub-demo.gif" alt="DecisionHub Demo" width="800" />
  <p><i>Decision Hub usage demo</i></p>
</div>

### Key Features

- 🚀 **Multi-method**: Supports Profile Matching and Weighted Product methods
- 👥 **Collaboration**: Project-based system enabling team collaboration
- 🔐 **Authentication**: Security with Supabase Authentication
- 🎨 **Modern UI**: Intuitive interface with light/dark mode
- 📊 **Visualization**: Easy-to-understand calculation results
- 📱 **Responsive**: Accessible across various devices

### Built With

- [React](https://react.dev/) - JavaScript library for UI
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript superset
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend as a Service for authentication and PostgreSQL database
- [Prisma](https://www.prisma.io/) - ORM for TypeScript and JavaScript
- [React Router](https://reactrouter.com/) - Routing for React applications
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## Running Locally

### Prerequisites

- Node.js 18.x or Newer
- PNPM (Recommended) or NPM
- Supabase

### Installation

1. Clone repository

   ```sh
   git clone https://github.com/antsistra/DecisionHub.git
   cd DecisionHub
   ```

2. Install dependencies

   ```sh
   pnpm install
   ```

3. Copy the env-example file to .env and fill it with the required values

   ```sh
   cp env-example .env
   ```

   After copying, open the .env file and adjust the configuration with the necessary values (e.g., database connection string, API keys, etc.).

4. Set up database with Prisma

   ```sh
   npx prisma migrate dev --name init
   ```

5. Run the application in development mode
   ```sh
   pnpm dev
   ```

### Deployment

Build App Command

```sh
pnpm build
```

## How to Use

1. **Register & Login**: Create an account or login with an existing account
2. **Create Project**: Create a new project or join an existing project using an invitation code
3. **Setup Criteria**: Add the required criteria
4. **Add Alternatives**: Add alternatives to be evaluated
5. **Assessment**: Rate each alternative based on criteria
6. **View Results**: Check calculation results and rankings of each alternative

## Contributing

Contributions make the open source community an amazing place to learn, inspire, and create. Any contributions you make are greatly **appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/FiturMantapBetul`)
3. Commit your changes (`git commit -m 'Add some FiturMantapBetul'`)
4. Push to the branch (`git push origin feature/FiturMantapBetul`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Hadi Nur Muhammad - hadinurmuhamad8@gmail.com
