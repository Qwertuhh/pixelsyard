export default function Home() {
  return (
   <>
    <div className="alert alert-warning">
      <h4 className="alert-heading">Incompleted Project</h4>
      <p>
        This project is incomplete because of the service provider{"'"}s
        restriction on age.
      </p>
      <hr />
      <p className="mb-0">
        Please use the imageKit service to upload images.
      </p>
    </div>
    
   </>
  );
}
