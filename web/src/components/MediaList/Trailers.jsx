import PropTypes from "prop-types";
import { CgClose } from "react-icons/cg";

function Trailers({ setModal, trailerVideo }) {
  const videoTrailer = trailerVideo;
  return (
    <button
      className="absolute bg-local object-cover backdrop-blur-md bg-transparent/40 rounded-3xl h-full w-full grid sm:grid-cols-auto md:grid-cols-6 gap-4 z-49"
      onClick={() => setModal(false)}
      type="submit"
    >
      <div className="absolute right-0 cursor-pointer md:col-start-2 md:col-span-4 sm:col-auto hover:text-[#b1a9fa]">
        <CgClose
          className="inline-block align-middle"
          size={24}
          alt="Cerrar"
          onClick={() => setModal(false)}
        />
      </div>

      <iframe
        className="w-full float-right aspect-video pt-10 md:col-start-2 md:col-span-4 sm:col-auto"
        src={`https://www.youtube.com/embed/${videoTrailer}`}
      />
    </button>
  );
}

export default Trailers;

Trailers.defaultProps = {
  setModal: () => {},
  trailerVideo: "",
};

Trailers.propTypes = {
  setModal: PropTypes.func,
  trailerVideo: PropTypes.string,
};
