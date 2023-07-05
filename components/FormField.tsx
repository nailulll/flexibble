import React from "react";

type Props = {
  type?: string;
  title: string;
  state: string;
  placeholder: string;
  isTextarea?: boolean;
  setState: (value: string) => void;
};

const FormField = ({
  type,
  title,
  state,
  placeholder,
  isTextarea,
  setState,
}: Props) => {
  return (
    <div className="flexStart flex-col w-full gap-4">
      <label htmlFor="" className="w-full text-gray-100">
        {title}
      </label>
      {isTextarea ? (
        <textarea
          placeholder={placeholder}
          value={state}
          required
          className="form_field-input"
          onChange={(e) => setState(e.target.value)}
        />
      ) : (
        <input
          type={type || "text"}
          placeholder={placeholder}
          value={state}
          required
          className="form_field-input"
          onChange={(e) => setState(e.target.value)}
        />
      )}
    </div>
  );
};

export default FormField;
