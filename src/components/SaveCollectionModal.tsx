import { Divider, Input, Modal, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";

const { Text } = Typography;

type SaveCollectionModalProps = {
  open: boolean;
  collectionName: string;
  setCollectionName: Dispatch<SetStateAction<string>>;
  onCancel: () => void;
  onOk: () => void;
};

const SaveCollectionModal = ({ open, collectionName, setCollectionName, onCancel, onOk }: SaveCollectionModalProps) => (
  <Modal open={open} title="Save to collection" onCancel={onCancel} onOk={onOk} okButtonProps={{ disabled: !collectionName.trim() }}>
    <Input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="Collection name" />
    <Divider />
    <Text type="secondary">Saved payload includes code, runtime settings, watched variables, variable overrides, and the current rendered visuals.</Text>
  </Modal>
);

export default SaveCollectionModal;
