import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { dataProvider } from "@providers/data-provider";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
interface UploadAvatarProps {
  setUrlAvatar: (avatarProps: AvatarProps) => void;
  publicId?: string;
  url?: string;
}

export type AvatarProps = {
  PublicId: string;
  Url: string;
};

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("Hệ thống chỉ hỗ trợ tải lên tệp định dạng JPG/PNG!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Kích thước ảnh không được vượt quá 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

export const UploadAvatar: React.FC<UploadAvatarProps> = ({ setUrlAvatar, publicId, url }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  React.useEffect(() => {
    if (url && publicId) {
      setFileList([{ uid: publicId, name: "image.png", status: "done", url }]);
    }
  }, [url, publicId]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const file = newFileList[newFileList.length - 1];
    if (file && file.status === "done" && file.response) {
      var avatarResponse = file.response as AvatarProps;
      setUrlAvatar(avatarResponse);
      message.success("Tải ảnh lên thành công");
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none", color: '#476481' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8, fontWeight: 500 }}>Tải Ảnh Lên</div>
    </button>
  );

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleOnRemove = async (file: UploadFile) => {
    var targetFile = fileList[0];
    if (targetFile.response) {
      var avatarResponse = targetFile.response as AvatarProps;
      await dataProvider.deleteFile(avatarResponse.PublicId);
      setUrlAvatar({ PublicId: "", Url: "" });
    } else if (targetFile.uid && targetFile.url) {
      await dataProvider.deleteFile(targetFile.uid);
      setUrlAvatar({ PublicId: "", Url: "" });
    }
    setFileList(fileList.filter((f) => f.uid !== targetFile.uid));
    message.success("Đã gỡ ảnh đại diện");
  };

  return (
    <>
      <Upload
        action="/api/file"
        listType="picture-circle"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        onRemove={handleOnRemove}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};