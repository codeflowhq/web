import { Button, Card, Space, Tag, Typography } from "antd";

const { Text } = Typography;

const ExamplesPage = ({ examples, onLoadExample }) => (
  <div className="collections-page">
    <Card className="surface-card" title="Examples / Market" extra={<Text type="secondary">Common algorithms and view usage presets</Text>}>
      <div className="examples-list">
        {examples.map((example) => (
          <div key={example.key} className="examples-list-item">
            <div className="examples-list-copy">
              <Text strong>{example.title}</Text>
              <Space orientation="vertical" size={4}>
                <Text type="secondary">{example.description}</Text>
                <Space wrap>
                  {example.tags?.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Space>
            </div>
            <Button type="primary" onClick={() => onLoadExample(example)}>
              Load
            </Button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default ExamplesPage;
