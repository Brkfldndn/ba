import { fetchStudyInstruction } from "./actions";
import Link from "next/link";

const Home = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const study = searchParams.study as string;



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
    console.log(data)
  } catch (error) {
    console.error('Error fetching data:', error);
    data = [];
  }

  return (
    <div className="w-full flex flex-col items-center justify-center " style={{ height: 'calc(100vh - 89px)' }}>
      <div className="text-xl p-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-5 mb-10">
              <div className="text-4xl font-bold">{item.titel}</div>
              <div>{item.description}</div>
            </div>
          ))
        ) : (
          <p>No instructions found.</p>
        )}
      </div>
      <Link href={`/tasks?study=${study}`}  className="cursor-pointer text-4xl font-bold p-5 py-4 border bg-[#B10034] hover:scale-110 transition duration-500 rounded-full text-white hover:text-[#B10034] hover:bg-white hover:border-spacing-6 border-hidden border-neutral-300">
        Starte den Test
      </Link>
    </div>
  );
}

export default Home;
