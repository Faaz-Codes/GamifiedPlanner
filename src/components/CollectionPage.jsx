import PostcardCard from './PostcardCard';

function CollectionPage({ postcards, setPage }) {
  const completed = postcards.filter((postcard) => postcard.completed);

  return (
    <section className="card panel collection-page">
      <div className="header">
        <h2>Collected Postcards</h2>
        <button onClick={() => setPage('tasks')} type="button">
          Back
        </button>
      </div>

      {completed.length ? (
        <div className="postcard-grid">
          {completed.map((postcard) => (
            <PostcardCard key={postcard.id} postcard={postcard} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No postcards collected yet. Complete daily progress to fill your collection.</p>
      )}
    </section>
  );
}

export default CollectionPage;
