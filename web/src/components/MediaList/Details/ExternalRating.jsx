
function ExternalRating({ icon, alt, value = null, iconClassName = 'inline-block pr-1 w-10' }) {
  if (!value || value <= 0) return null;
  return (
    <div>
      <img className={iconClassName} src={icon} alt={alt} />
      <div className="inline-block text-amber-400 text-xs text-left pl-2">
        {value}
      </div>
    </div>
  );
}
export default ExternalRating;
