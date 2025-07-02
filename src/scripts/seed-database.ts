import { producersApi, productLotsApi } from "@/services/api";
import { sampleProducers, sampleProductLots } from "@/data/sample-data";

export const seedDatabase = async () => {
  try {
    console.log("🌱 Iniciando população do banco de dados...");

    // Criar produtores
    console.log("📝 Criando produtores...");
    const createdProducers = [];
    
    for (const producer of sampleProducers) {
      try {
        const createdProducer = await producersApi.create(producer);
        createdProducers.push(createdProducer);
        console.log(`✅ Produtor criado: ${createdProducer.name}`);
      } catch (error) {
        console.error(`❌ Erro ao criar produtor ${producer.name}:`, error);
      }
    }

    // Criar lotes de produtos
    console.log("📦 Criando lotes de produtos...");
    
    for (let i = 0; i < sampleProductLots.length; i++) {
      const lot = sampleProductLots[i];
      const producerIndex = i % createdProducers.length; // Distribuir entre os produtores
      const producerId = createdProducers[producerIndex]?.id;
      
      if (!producerId) {
        console.error(`❌ Produtor não encontrado para o lote ${lot.code}`);
        continue;
      }

      try {
        const lotWithProducer = {
          ...lot,
          producer_id: producerId,
        };
        
        const createdLot = await productLotsApi.create(lotWithProducer);
        console.log(`✅ Lote criado: ${createdLot.code} - ${createdLot.name}`);
      } catch (error) {
        console.error(`❌ Erro ao criar lote ${lot.code}:`, error);
      }
    }

    console.log("🎉 População do banco de dados concluída!");
    console.log(`📊 Resumo:`);
    console.log(`   - Produtores criados: ${createdProducers.length}`);
    console.log(`   - Lotes criados: ${sampleProductLots.length}`);
    
    return {
      producers: createdProducers,
      lots: sampleProductLots.length,
    };
  } catch (error) {
    console.error("❌ Erro durante a população do banco de dados:", error);
    throw error;
  }
};

// Função para executar o script diretamente
if (typeof window !== "undefined") {
  // No navegador, adicionar ao objeto global para uso no console
  (window as any).seedDatabase = seedDatabase;
} 