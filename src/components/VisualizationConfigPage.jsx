import { Card, Form, Input, InputNumber, Select, Space, Table, Typography } from "antd";

import { TYPE_VIEW_DEFAULT_ROWS } from "../configDefaults";

const { Paragraph, Text } = Typography;

const booleanOptions = [
  { label: "Hidden", value: false },
  { label: "Visible", value: true },
];

const VisualizationConfigPage = ({
  globalConfig,
  setGlobalConfig,
  variableConfigRows,
  configTableColumns,
  outputFormatOptions,
  converterOptions,
  viewKindOptions,
}) => {
  const typeDefaultRows = TYPE_VIEW_DEFAULT_ROWS.map((row) => ({
    ...row,
    viewKind: globalConfig.typeViewDefaults?.[row.key] ?? "auto",
  }));

  const typeDefaultColumns = [
    { title: "Data type", dataIndex: "label", key: "label" },
    {
      title: "Default view",
      dataIndex: "viewKind",
      key: "viewKind",
      render: (value, record) => (
        <Select
          value={value}
          options={viewKindOptions.map((option) => ({ label: option, value: option }))}
          style={{ width: 180 }}
          onChange={(nextValue) =>
            setGlobalConfig((prev) => ({
              ...prev,
              typeViewDefaults: {
                ...(prev.typeViewDefaults ?? {}),
                [record.key]: nextValue,
              },
            }))
          }
        />
      ),
    },
  ];

  return (
    <div className="config-page-grid config-page-grid-wide">
      <Card className="surface-card" title="Rendering defaults">
        <Paragraph type="secondary">
          Global settings define the default output. Variable-level settings override them per watched variable. Global max depth remains the final hard cap.
        </Paragraph>
        <Form layout="vertical" className="compact-form-grid">
          <Form.Item label="Output format">
            <Select
              value={globalConfig.outputFormat}
              options={outputFormatOptions}
              onChange={(value) => setGlobalConfig((prev) => ({ ...prev, outputFormat: value }))}
            />
          </Form.Item>
          <Form.Item label="Converter">
            <Select
              value={globalConfig.converter}
              options={converterOptions}
              onChange={(value) => setGlobalConfig((prev) => ({ ...prev, converter: value }))}
            />
          </Form.Item>
          <Form.Item label="Titles">
            <Select
              value={globalConfig.showTitles}
              options={booleanOptions}
              onChange={(value) => setGlobalConfig((prev) => ({ ...prev, showTitles: value }))}
            />
          </Form.Item>
          <Form.Item label="Max depth">
            <InputNumber min={0} max={20} value={globalConfig.maxDepth} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, maxDepth: value ?? 3 }))} />
          </Form.Item>
          <Form.Item label="Default recursion depth">
            <InputNumber min={-1} max={20} value={globalConfig.recursionDepthDefault} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, recursionDepthDefault: value ?? -1 }))} />
          </Form.Item>
          <Form.Item label="Auto depth cap">
            <InputNumber min={0} max={20} value={globalConfig.autoRecursionDepthCap} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, autoRecursionDepthCap: value ?? 6 }))} />
          </Form.Item>
          <Form.Item label="Max items per view">
            <InputNumber min={1} max={200} value={globalConfig.maxItemsPerView} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, maxItemsPerView: value ?? 50 }))} />
          </Form.Item>
          <Form.Item label="Global max steps">
            <InputNumber min={1} max={500} value={globalConfig.stepLimit} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, stepLimit: value ?? 12 }))} />
          </Form.Item>
        </Form>
      </Card>

      <Card className="surface-card" title="Browser runtime">
        <Paragraph type="secondary">
          These options only affect the in-browser Pyodide runtime.
        </Paragraph>
        <Form layout="vertical">
          <Form.Item label="Runtime packages">
            <Input
              value={globalConfig.runtimePackages}
              placeholder="pillow, scipy"
              onChange={(event) => setGlobalConfig((prev) => ({ ...prev, runtimePackages: event.target.value }))}
            />
          </Form.Item>
          <Paragraph type="secondary">Comma-separated PyPI packages installed at runtime.</Paragraph>
          <Form.Item label="Runtime wheels">
            <Input
              value={globalConfig.runtimeWheels}
              placeholder="/pyodide/wheels/custom.whl, https://host/pkg.whl"
              onChange={(event) => setGlobalConfig((prev) => ({ ...prev, runtimeWheels: event.target.value }))}
            />
          </Form.Item>
          <Paragraph type="secondary">Comma-separated wheel URLs or site-local wheel paths.</Paragraph>
        </Form>
      </Card>

      <Card className="surface-card" title="Data type defaults">
        <Table rowKey="key" pagination={false} dataSource={typeDefaultRows} columns={typeDefaultColumns} />
      </Card>

      <Card className="surface-card" title="Variable overrides">
        <Table rowKey="variable" pagination={false} dataSource={variableConfigRows} columns={configTableColumns} />
      </Card>
    </div>
  );
};

export default VisualizationConfigPage;
