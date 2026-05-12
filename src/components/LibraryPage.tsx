import { useMemo, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { CollectionRecord, ExampleRecord } from "../shared/types/visualization";

const { Search } = Input;
const { Text } = Typography;

type LibraryPageProps = {
  collectionColumns: ColumnsType<CollectionRecord>;
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onLoadExample: (example: ExampleRecord) => void;
};

const LibraryPage = ({ collectionColumns, collections, examples, onLoadExample }: LibraryPageProps) => {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");

  const tags = useMemo(() => {
    const values = new Set<string>();
    examples.forEach((example) => example.tags?.forEach((tag) => values.add(tag)));
    return ["all", ...Array.from(values).sort()];
  }, [examples]);

  const filteredExamples = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return examples.filter((example) => {
      const matchesTag = tagFilter === "all" || example.tags?.includes(tagFilter);
      if (!matchesTag) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${example.title} ${example.description} ${(example.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [examples, query, tagFilter]);

  return (
    <div className="library-grid">
      <Card className="surface-card" title="Examples" extra={<Text type="secondary">Common algorithms and nested structure presets</Text>}>
        <Space wrap style={{ marginBottom: 12 }}>
          <Search value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search examples" style={{ width: 220 }} />
          <Select value={tagFilter} options={tags.map((tag) => ({ label: tag, value: tag }))} onChange={setTagFilter} style={{ width: 180 }} />
        </Space>
        <div className="examples-list">
          {filteredExamples.map((example) => (
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

      <Card className="surface-card" title="Collections" extra={<Text type="secondary">Saved code, watch settings, and rendered visuals</Text>}>
        <Table
          rowKey="id"
          columns={collectionColumns}
          dataSource={collections}
          pagination={false}
          locale={{ emptyText: "No saved collections." }}
        />
      </Card>
    </div>
  );
};

export default LibraryPage;
