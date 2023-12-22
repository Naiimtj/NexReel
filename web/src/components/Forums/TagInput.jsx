import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

function TagInput({
  register,
  setValue,
  errors,
  dirtyFields,
  transl,
  defaultTags,
}) {
  const [tags, setTags] = useState(defaultTags || []);
  const [inputValue, setInputValue] = useState("");
 
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      const newTag = `#${inputValue.trim()}`;
      setTags([...tags, newTag]);
      setInputValue("");
      setValue("tags", [...tags, newTag]);
    }
  };

  const removeTag = (indexToRemove) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  useEffect(() => {
    if (defaultTags) {
      setTags(defaultTags);
      setValue("tags", defaultTags);
    }
    register("tags");
  }, [register, setValue, defaultTags]);

  return (
    <div className="relative">
      <label
        htmlFor="tags"
        className="block mb-2 text-sm font-medium text-gray-200"
      >
        * {transl("Tags")}:
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="relative flex items-center bg-gray-200 text-gray-600 rounded-lg px-2 py-1"
          >
            <span>{tag}</span>
            <div
              className="absolute flex items-center bg-purple-950 text-white rounded-full -top-2 -right-2 cursor-pointer hover:scale-110"
              onClick={() => removeTag(index)}
            >
              <IoClose size={20} alt={transl("Close")} />
            </div>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        className="bg-gray-50 border border-gray-300 text-gray-600 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5 mt-2"
        placeholder={transl("Add tags (press Enter to add)")}
        id="tags"
      />
      {errors.tags ? (
        <span className="text-red-600">{transl(errors.tags.message)}</span>
      ) : dirtyFields.tags ? (
        <div className="text-green-600 absolute bottom-1 right-0">
          <BsCheckLg size={30} alt={transl("Valid")} />
        </div>
      ) : null}
    </div>
  );
}

export default TagInput;

TagInput.defaultProps = {
  register: () => {},
  setValue: () => {},
  errors: {},
  dirtyFields: {},
  transl: () => {},
  defaultTags: [],
};

TagInput.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  dirtyFields: PropTypes.object,
  transl: PropTypes.func,
  defaultTags: PropTypes.arrayOf(PropTypes.string),
};
