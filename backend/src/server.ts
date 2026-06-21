import app from "./app";

const PORT = process.env.PORT || 5000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur SmartCaravan démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

startServer();
