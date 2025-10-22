# 🏛️ Blockchain-Verified Authenticity Certificates for Museums

Welcome to a revolutionary system for ensuring the authenticity and provenance of museum artifacts and artworks! This Web3 project leverages the Stacks blockchain and Clarity smart contracts to create immutable, verifiable certificates of authenticity. It solves the real-world problem of art forgery, theft, and disputed ownership in the museum and cultural heritage sector, where billions are lost annually to fakes. By tokenizing certificates on-chain, museums can provide transparent proof of origin, history, and legitimacy, reducing fraud and enhancing trust for collectors, insurers, and the public.

## ✨ Features

🔒 Issue tamper-proof digital certificates tied to physical artifacts  
📜 Track provenance with an immutable history of ownership and transfers  
🏷️ Register museums and curators with verified identities  
✅ Instant verification of authenticity via blockchain queries  
🔄 Secure ownership transfers with escrow mechanisms  
⚖️ Dispute resolution through on-chain voting by stakeholders  
📈 Analytics for artifact history and valuation trends  
🚫 Prevent duplicate or fraudulent registrations using unique hashes  
🖼️ Integration with NFTs for digital representations of artifacts  
🌐 Public dashboard for querying certificate details (off-chain UI not included)

## 🛠 How It Works

This project consists of 8 interconnected Clarity smart contracts deployed on the Stacks blockchain. Each contract handles a specific aspect of the system, ensuring modularity, security, and scalability. Creators (museums or curators) interact via a frontend (not provided here), but all logic is on-chain.

### Key Smart Contracts
1. **MuseumRegistry.clar**: Registers museums and curators with verified principals (addresses). Ensures only authorized entities can issue certificates.
2. **ArtifactRegistration.clar**: Allows registration of artifacts with unique hashes (e.g., SHA-256 of photos/descriptions) to prevent duplicates.
3. **CertificateIssuance.clar**: Issues blockchain-verified certificates, linking artifacts to metadata like origin, date, and initial owner.
4. **ProvenanceTracker.clar**: Records the full history of an artifact, including transfers, restorations, or loans, in an immutable ledger.
5. **OwnershipTransfer.clar**: Handles secure transfers of ownership, updating provenance and requiring multi-signature approvals.
6. **EscrowMechanism.clar**: Provides escrow for artifact sales or loans, holding funds/STX until conditions (e.g., physical delivery) are met.
7. **DisputeResolution.clar**: Enables stakeholders to raise disputes and resolve them via on-chain voting or arbitration.
8. **VerificationUtils.clar**: Utility contract for querying and verifying certificate details, ownership, and authenticity without mutating state.

**For Museums/Curators**  
- Register your museum via `MuseumRegistry` with proof of identity (e.g., linked to a real-world verifier).  
- Generate a unique hash of the artifact (image, description, etc.).  
- Call `register-artifact` in `ArtifactRegistration` with hash, title, description, and origin details.  
- Issue a certificate using `CertificateIssuance`, which mints an on-chain token representing authenticity.  
- For transfers, use `OwnershipTransfer` with escrow via `EscrowMechanism` to ensure safe handovers.  

**For Verifiers (Collectors, Insurers, Public)**  
- Query `get-certificate-details` in `VerificationUtils` with the artifact hash or ID to view metadata and provenance.  
- Call `verify-authenticity` to confirm the certificate's validity and chain of custody.  
- Check disputes in `DisputeResolution` for any ongoing issues.  

That's it! Your artifacts now have unbreakable, blockchain-backed proof of authenticity, making museums more secure and transparent in a digital age.