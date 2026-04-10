import { useState } from 'react';
import Modal from './Modal';
import PostcardCard from './PostcardCard';

function PostcardGrid({ postcards, highlightedPostcardId }) {
  const [selected, setSelected] = useState(null);

  return (
    <section className="card panel">
      <div className="panel-header">
        <h2>Postcards</h2>
      </div>

      <div className="postcard-grid">
        {postcards.map((postcard) => (
          <PostcardCard
            key={postcard.id}
            postcard={postcard}
            onOpen={setSelected}
            highlighted={highlightedPostcardId === postcard.id}
          />
        ))}
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="modal-content">
            <h3>{selected.title}</h3>
            <div className="modal-postcard" style={{ backgroundImage: `url(${selected.imageUrl})` }}>
              <div className={`modal-layer ${selected.completed ? 'clear' : ''}`} />
              {!selected.completed ? (
                <div className="piece-grid" style={{ '--pieces': selected.totalPieces }}>
                  {Array.from({ length: selected.totalPieces }).map((_, index) => {
                    const unlocked = index < selected.unlockedPieces;
                    return <span key={index} className={`piece ${unlocked ? 'unlocked' : ''}`} />;
                  })}
                </div>
              ) : null}
            </div>
            <p>
              {selected.completed
                ? 'Completed postcard unlocked 🎉'
                : `${selected.unlockedPieces}/${selected.totalPieces} pieces unlocked`}
            </p>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default PostcardGrid;
