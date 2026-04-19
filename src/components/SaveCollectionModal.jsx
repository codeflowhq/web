import { Divider, Input, Modal, Typography } from "antd";

const { Text } = Typography;

const SaveCollectionModal = ({ open, collectionName, setCollectionName, onCancel, onOk }) => (
  <Modal open={open} title="Save to collection" onCancel={onCancel} onOk={onOk} okButtonProps={{ disabled: !collectionName.trim() }}>
    <Input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="Collection name" />
    <Divider />
    <Text type="secondary">Saved payload includes code, global config, variable config, and watch variables.</Text>
  </Modal>
);

export default SaveCollectionModal;
