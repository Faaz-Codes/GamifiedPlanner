import { useState } from 'react';
import Modal from './Modal';
import PostcardCard from './PostcardCard';

function PostcardGrid({ postcards, highlightedPostcardId }) {
  const [selected, setSelected] = useState(null);
  const columns = 4;

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
            <div className="modal-postcard">
              <div
                className="postcard-image-grid"
                style={{ '--columns': columns, '--rows': Math.ceil(selected.totalPieces / columns) }}
              >
                {Array.from({ length: selected.totalPieces }).map((_, index) => {
                  const revealed = index < selected.unlockedPieces;
                  const rows = Math.ceil(selected.totalPieces / columns);
                  const row = Math.floor(index / columns);
                  const column = index % columns;
                  const postcardImage = selected.image ?? selected.imageUrl;

                  return (
                    <span
                      key={index}
                      className={`piece ${revealed ? 'revealed' : 'hidden'}`}
                      style={{
                        backgroundImage: revealed ? `url(${postcardImage})` : 'none',
                        backgroundSize: `${columns * 100}% ${rows * 100}%`,
                        backgroundPosition: `${(column / Math.max(columns - 1, 1)) * 100}% ${(row / Math.max(rows - 1, 1)) * 100}%`
                      }}
                    />
                  );
                })}
              </div>
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
