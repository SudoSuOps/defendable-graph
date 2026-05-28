import { PrismaClient } from "@prisma/client";
import { artifacts, entities, events, proofTraces, relationships } from "../lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.graphEvent.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.proofTrace.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.entity.deleteMany();

  for (const entity of entities) await prisma.entity.create({ data: { ...entity, metadata: JSON.stringify(entity.metadata) } });
  for (const relationship of relationships) await prisma.relationship.create({ data: { ...relationship, metadata: JSON.stringify(relationship.metadata) } });
  for (const artifact of artifacts) await prisma.artifact.create({ data: { ...artifact, metadata: JSON.stringify(artifact.metadata) } });
  for (const proof of proofTraces) await prisma.proofTrace.create({ data: { ...proof, datasetIds: JSON.stringify(proof.datasetIds), metadata: JSON.stringify(proof.metadata) } });
  for (const event of events) await prisma.graphEvent.create({ data: { ...event, metadata: JSON.stringify(event.metadata), createdAt: new Date(event.createdAt) } });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
