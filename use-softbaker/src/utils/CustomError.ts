class CustomError extends Error {
    public code;
    constructor(message: string, code: string) {
      super(message);
      this.name = 'CustomError';
      this.code = code;
      // Ensure the correct prototype chain
      Object.setPrototypeOf(this, new.target.prototype);
    }
}

export default CustomError