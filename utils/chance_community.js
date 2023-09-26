const { setDoc, doc } = require("firebase/firestore");
const { db } = require("../firebase");

const chance = async (currentParticipant, pos) => {
  const ch = Math.ceil(Math.random() * 7);
  switch (ch) {
    case 1:
      const document = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 100,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document
      );
      return {
        title: "Hackathon Victory",
        message:
          "Congratulations! You won a hackathon. Collect $100 as a reward for your coding skills",
      };
      break;
    case 2:
      const document2 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 50,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document2
      );
      return {
        title: "Bug Bounty Payout",
        message:
          "Report a Critical Bug and receive a reward of $50 from a tech giant. Collect $50",
      };
      break;
    case 3:
      const document3 = {
        ...currentParticipant,
        balance:
          parseInt(currentParticipant.balance) - 50 > 0
            ? parseInt(currentParticipant.balance) - 50
            : 0,
        position: pos + 3,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document3
      );
      return {
        title: "Tech Conference",
        message:
          "Attend a tech conference. Pay $50 for the conference fee. Gain knowledge and advance 3 spaces.",
      };
      break;
    case 4:
      const document4 = {
        ...currentParticipant,
        balance:
          parseInt(currentParticipant.balance) - 50 > 0
            ? parseInt(currentParticipant.balance) - 50
            : 0,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document4
      );
      return {
        title: "Cryptolocker Virus",
        message:
          "Your computer has been infected with Cryptolocker! Pay a $50 ransom to unlock your files.",
      };
      break;
    case 5:
      const document5 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 20,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document5
      );
      return {
        title: "Tech Startup",
        message: "Collect $20 as an investment in your company.",
      };
      break;
    case 6:
      if (currentParticipant.propertiesOwned) {
        const document6 = {
          ...currentParticipant,
          balance:
            parseInt(currentParticipant.balance) + 25 * propertiesOwned.length,
          position: pos,
        };
        await setDoc(
          doc(
            db,
            currentParticipant.batchNo.toString(),
            currentParticipant.teamName
          ),
          document6
        );
      }
      return {
        title: "Cryptocurrency Investment",
        message:
          "Invest in cryptocurrrency early. Collect $25 for each property you own.",
      };
      break;
    case 7:
      const document7 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 50,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document7
      );
      return { title: "Tech Patent", message: "Collect $50 in royalties." };
      break;
    default:
      break;
  }
};

const communityChest = async (currentParticipant, pos) => {
  const ch = Math.ceil(Math.random() * 8);
  switch (ch) {
    case 1:
      const document1 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 50,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document1
      );
      return {
        title: "Open-Source Contribution",
        message:
          "Contribute to an open-source project. Collect $50 in recognition of your tech skills.",
      };
      break;
    case 2:
      const document2 = {
        ...currentParticipant,
        balance:
          parseInt(currentParticipant.balance) - 25 > 0
            ? parseInt(currentParticipant.balance) - 25
            : 0,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document2
      );
      return {
        title: "Virus Scan",
        message:
          "Your antivirus software has detected a virus. Pay $25 for cleanup.",
      };
      break;
    case 3:
      const document3 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 100,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document3
      );
      return {
        title: "Tech IPO",
        message: "Your tech company is going public. Collect $100",
      };
      break;
    case 4:
      const document4 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 10,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document4
      );
      return {
        title: "Tech Blog",
        message:
          "Your tech blog gains popularity. Collect $10 as advertising revenue. ",
      };
      break;
    case 5:
      const document5 = {
        ...currentParticipant,
        balance: parseInt(currentParticipant.balance) + 60,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document5
      );
      return {
        title: "Virtual Reality Project",
        message:
          "Work on a VR project. Collect $60 for your futuristic creation.",
      };
      break;
    case 6:
      const document6 = {
        ...currentParticipant,
        balance:
          parseInt(currentParticipant.balance) - 75 > 0
            ? parseInt(currentParticipant.balance) - 75
            : 0,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document6
      );
      return {
        title: "Tech Acquisition",
        message: "Acquire a rival tech startup. Pay $75 for the puchase.",
      };
      break;
    case 7:
      const document7 = {
        ...currentParticipant,
        balance:
          parseInt(currentParticipant.balance) - 50 > 0
            ? parseInt(currentParticipant.balance) - 50
            : 0,
        position: pos,
      };
      await setDoc(
        doc(
          db,
          currentParticipant.batchNo.toString(),
          currentParticipant.teamName
        ),
        document7
      );
      return {
        title: "Smart Home Upgrade",
        message: "Upgrade your home with smart tech. Pay $50 for the upgrade.",
      };
      break;
    case 8:
      if (currentParticipant.propertiesOwned) {
        const document8 = {
          ...currentParticipant,
          balance:
            parseInt(currentParticipant.balance) +
            25 * parseInt(propertiesOwned.length),
          position: pos,
        };
        await setDoc(
          doc(
            db,
            currentParticipant.batchNo.toString(),
            currentParticipant.teamName
          ),
          document8
        );
        return {
          title: "BlockChain Investment",
          message:
            "Invest in blockchain technology. Collect $25 for each property you own.",
        };
      }
    default:
      break;
  }
};

module.exports = { chance, communityChest };
