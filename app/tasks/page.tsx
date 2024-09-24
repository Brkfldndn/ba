import StudyWrapper from "@/components/StudyWrapper";
import { fetchQuestions } from "../actions";
import Navbar from "@/components/Navbar";
import ContentPages from "@/components/ContentPages";

const Home = async ({ searchParams }: { searchParams: { [key: string]: string  | undefined } }) => {
  const studyParam = searchParams ? searchParams.study : undefined;
  const group = searchParams ? searchParams.group : undefined;
  console.log('Study parameter from URL:', studyParam);

  const study: number = parseInt(studyParam as string, 10);
  console.log('Converted study parameter to number:', study);

  if (isNaN(study)) {
    console.error('Invalid study parameter:', studyParam);
    throw new Error('Invalid study parameter');
  }

  let data = [];

  try {
    data = await fetchQuestions(study);
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <div className="p- h-full" style={{ height: 'calc(100vh - 110px)' }}>

      <StudyWrapper data={data} questions={data} group={group}/>
    </div>
  );
}

export default Home;