function PostcardCard({ postcard, onOpen, highlighted = false }) {
  const progress = `${postcard.unlockedPieces}/${postcard.totalPieces} pieces`;
  const columns = 4;
  const rows = Math.ceil(postcard.totalPieces / columns);
  const postcardImage = postcard.image ?? postcard.imageUrl;

  const handleOpen = () => {
    if (onOpen) onOpen(postcard);
  };

  return (
    <button className={`postcard-card ${highlighted ? 'highlight' : ''}`} onClick={handleOpen} type="button">
      <div className="postcard-image">
        <div className="postcard-image-grid" style={{ '--columns': columns, '--rows': rows }}>
          {Array.from({ length: postcard.totalPieces }).map((_, index) => {
            const revealed = index < postcard.unlockedPieces;
            const row = Math.floor(index / columns);
            const column = index % columns;

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
      <div className="postcard-info">
        <h3 className="postcard-title">{postcard.title}</h3>
        <p className="postcard-subtext">{progress}</p>
      </div>
    </button>
  );
}

export default PostcardCard;
