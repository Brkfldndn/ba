import StudyWrapper from "@/components/Studywrapper";
import { fetchStudyInstruction } from "../actions";

const Home = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const studyParam = searchParams ? searchParams.study : undefined;
  console.log('Study parameter from URL:', studyParam);

  const study: number = parseInt(studyParam as string, 10);
  console.log('Converted study parameter to number:', study);

  if (isNaN(study)) {
    console.error('Invalid study parameter:', studyParam);
    throw new Error('Invalid study parameter');
  }

  let data = [];

  try {
    data = await fetchStudyInstruction(study);
    console.log('Data3:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <div className="p-4" style={{ height: 'calc(100vh - 189px)' }}>
      <StudyWrapper data={data} />
    </div>
  );
}

export default Home;