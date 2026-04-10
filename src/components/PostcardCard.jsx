function PostcardCard({ postcard, onOpen, highlighted = false }) {
  const progress = `${postcard.unlockedPieces}/${postcard.totalPieces} pieces`;

  const handleOpen = () => {
    if (onOpen) onOpen(postcard);
  };

  return (
    <button className={`postcard-card ${highlighted ? 'highlight' : ''}`} onClick={handleOpen} type="button">
      <div className="postcard-image" style={{ backgroundImage: `url(${postcard.imageUrl})` }}>
        <div className="piece-grid" style={{ '--pieces': postcard.totalPieces }}>
          {Array.from({ length: postcard.totalPieces }).map((_, index) => {
            const unlocked = index < postcard.unlockedPieces;
            return <span key={index} className={`piece ${unlocked ? 'unlocked' : ''}`} />;
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
