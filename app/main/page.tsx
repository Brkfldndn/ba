import { fetchStudyInstruction, fetchStudyTasks } from '../actions';

const HomePage = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const study = searchParams.study as string;

  console.log(study)


  // funktioniert nicht ganz

  if (!study || typeof study !== 'string' ||  study.length === 0) {
    return (
      <div>
        <h1>Study not available</h1>
      </div>
    );
  }


  let data;

  try {
    data = await fetchStudyInstruction(study);
  } catch (error) {
    console.error('Error fetching data:', error);
    data = [];
  }

  return (
    <div>
      <h1>Tasks from {study}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default HomePage;