import { getAllLessons } from "../../lib/content-db";
import LessonsExplorer from "./LessonsExplorer";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  return <LessonsExplorer lessonsBySubject={await getAllLessons()} />;
}