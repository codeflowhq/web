import { Card, Table, Typography } from "antd";

const { Text } = Typography;

const CollectionsPage = ({ collections, collectionColumns }) => (
  <div className="collections-page">
    <Card className="surface-card" title="Collections" extra={<Text type="secondary">Saved code + visualization config</Text>}>
      <Table rowKey="id" columns={collectionColumns} dataSource={collections} pagination={false} locale={{ emptyText: "No saved collections." }} />
    </Card>
  </div>
);

export default CollectionsPage;
