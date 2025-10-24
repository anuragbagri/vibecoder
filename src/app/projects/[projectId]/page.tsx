interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { projectId } = await params;

  return <div>project is : {projectId}</div>;
}
