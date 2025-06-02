import { Request, Response } from "express";
import cloudinary from "../cloudinary";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImage = [
  upload.single("image"),
  async (req: Request, res: Response): Promise<any>  => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error: any, result: any) => {
          if (error || !result) return res.status(500).json({ message: "Upload error" });
          res.json({ url: result.secure_url });
        }
      );
      stream.end(req.file.buffer);
    } catch {
      res.status(500).json({ message: "Upload error" });
    }
  }
];
