import { getEvents, getGraphData } from "@/lib/graph";
import { Shell } from "@/components/chrome";
import GraphExplorer from "@/components/graph-explorer";

export default async function GraphPage() {
  const [graph, events] = await Promise.all([getGraphData(), getEvents()]);
  return <Shell><GraphExplorer graph={graph} events={events} /></Shell>;
}
