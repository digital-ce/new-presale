# TON SBT Minter
A simple Next.js 14 application for minting Soulbound Tokens (SBTs) on The Open Network (TON) blockchain. This project demonstrates how to create a user-friendly interface for minting SBTs using modern web technologies.

## Project Overview
This application showcases:
- Integration with TON blockchain
- Wallet connection using TonConnect
- NFT collection metadata fetching
- SBT minting functionality
- Modern UI with Tailwind CSS

## How to Use
1. **Deploy Your SBT Collection**
   - Visit [sbt.nikandr.com](https://sbt.nikandr.com) to deploy your SBT collection
   - Fill in the collection metadata:
     - Collection name (15-30 characters)
     - Collection description (up to 500 characters)
     - Collection image (400x400 to 1000x1000 pixels, PNG/JPG/WebP/SVG)
     - Cover image (2880x680 pixels recommended)
     - Social links (up to 10)
   - Fill in the item metadata:
     - Item name (15-30 characters)
     - Item description (up to 500 characters)
     - Item image (1000x1000 pixels recommended)
   - Set your token price
   - Deploy the collection and sign the transaction with your wallet
   - Save the deployed collection's smart contract address

2. **Use This Minter**
   - Clone and set up this project
   - Replace the `SBT_CONTRACT_ADDRESS` in the code with your deployed collection address
   - Users can now connect their wallets and mint tokens from your collection

## Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- A TON wallet (like TonKeeper)
- GitHub account
- Vercel account (optional, for deployment)

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/nikandr-surkov/ton-sbt-minter.git
   cd ton-sbt-minter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the contract address:
   ```typescript
   // In components/MintSBT.tsx
   const SBT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `app/layout.tsx`: Root layout component with fonts and metadata
- `app/page.tsx`: Main page component with TonConnect provider
- `components/MintSBT.tsx`: Core minting component with TON integration
- `utils/contract-build/`: Smart contract interfaces

## Key Features
- Wallet connection using TonConnect
- SBT collection metadata fetching
- SBT minting functionality
- Loading states and error handling
- Responsive design with Tailwind CSS

## Technologies Used
- Next.js 14
- TypeScript
- Tailwind CSS
- TON Connect
- TON SDK

## Deployment
The app can be deployed to any hosting platform that supports Next.js. For the easiest deployment experience, use Vercel:

1. Push your code to a GitHub repository
2. Sign up for a Vercel account
3. Import your GitHub repository
4. Deploy with a single click

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.

## Learn More
- [The Open Network (TON)](https://ton.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TonConnect Documentation](https://docs.ton.org/develop/dapps/ton-connect/overview)

## Author
### Nikandr Surkov
- 🌐 Website: [nikandr.com](https://nikandr.com)
- 📺 YouTube: [@NikandrSurkov](https://www.youtube.com/@NikandrSurkov)
- 📱 Telegram: [@nikandr_s](https://t.me/nikandr_s)
- 📢 Telegram Channel: [Clicker Game News](https://t.me/clicker_game_news)
- 💻 GitHub: [nikandr-surkov](https://github.com/nikandr-surkov)
- 🐦 Twitter: [@NikandrSurkov](https://x.com/NikandrSurkov)
- 💼 LinkedIn: [Nikandr Surkov](https://www.linkedin.com/in/nikandr-surkov/)
- ✍️ Medium: [@NikandrSurkov](https://medium.com/@NikandrSurkov)
