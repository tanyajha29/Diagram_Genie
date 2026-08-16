import { Module } from '@nestjs/common';
import { ParserRegistry } from './registry/parser.registry';
import { ParserFactory } from './factory/parser.factory';
import { SqlParser } from './parsers/sql.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { ArchitectureParser } from './parsers/architecture.parser';
import { NodeClassifier } from './parsers/node-classifier.service';
import { MarkdownOutlineParser } from './parsers/markdown-outline.parser';
import { UmlSequenceParser } from './parsers/sequence.parser';
import { PrismaParser } from './parsers/prisma.parser';
import { TerraformParser } from './parsers/terraform.parser';
import { DockerComposeParser } from './parsers/docker-compose.parser';
import { OpenApiParser } from './parsers/openapi.parser';
import { PipelineDslParser } from './parsers/pipeline.parser';
import { FlowchartParser } from './parsers/flowchart.parser';
import { CloudDslParser } from './parsers/cloud.parser';
import { DefaultLayoutEngine } from './layout/default-layout.engine';
import { CapabilityRegistry } from './tool-registry/capability.registry';
import { ToolRegistry } from './tool-registry/tool.registry';

// Renderer / export adapter imports (shared by the legacy orchestrator and the
// stage-based pipeline — lives here so both consume a single registered instance)
import { RendererAdapterRegistry } from '../../modules/diagram/registry/renderer-adapter.registry';
import { ReactFlowAdapter } from '../../modules/diagram/adapters/react-flow.adapter';
import { MermaidAdapter } from '../../modules/diagram/adapters/mermaid.adapter';
import { CytoscapeAdapter } from '../../modules/diagram/adapters/cytoscape.adapter';

// Generation Pipeline imports
import { GenerationPipeline } from './pipeline/generation-pipeline';
import { ValidationStage } from './pipeline/stages/validation.stage';
import { FileDetectionStage } from './pipeline/stages/file-detection.stage';
import { ToolResolutionStage } from './pipeline/stages/tool-resolution.stage';
import { ParserStage } from './pipeline/stages/parser.stage';
import { LayoutStage } from './pipeline/stages/layout.stage';
import { RendererStage } from './pipeline/stages/renderer.stage';
import { ResponseStage } from './pipeline/stages/response.stage';

// File Detector imports
// ... (detectors remain identical)


// File Detector imports
import { FileDetectorRegistry } from './file-detector/registry/file-detector.registry';
import { FileDetectionService } from './file-detector/file-detection.service';
import { DockerComposeDetector } from './file-detector/detectors/docker-compose.detector';
import { OpenApiDetector } from './file-detector/detectors/openapi.detector';
import { TerraformDetector } from './file-detector/detectors/terraform.detector';
import { PrismaDetector } from './file-detector/detectors/prisma.detector';
import { ReadmeDetector } from './file-detector/detectors/readme.detector';
import { MarkdownDetector } from './file-detector/detectors/markdown.detector';
import { SqlDetector } from './file-detector/detectors/sql.detector';
import { JsonDetector } from './file-detector/detectors/json.detector';
import { YamlDetector } from './file-detector/detectors/yaml.detector';

// Layout Engine imports
import { LayoutRegistry } from './layout/registry/layout.registry';
import { TreeLayout } from './layout/algorithms/tree.layout';
import { HierarchicalLayout } from './layout/algorithms/hierarchical.layout';
import { GridLayout } from './layout/algorithms/grid.layout';
import { DagLayout } from './layout/algorithms/dag.layout';
import { RadialLayout } from './layout/algorithms/radial.layout';
import { ForceDirectedLayout } from './layout/algorithms/force-directed.layout';

@Module({
  providers: [
    ParserRegistry,
    ParserFactory,
    // Register parser plugins
    SqlParser,
    MarkdownParser,
    ArchitectureParser,
    NodeClassifier,
    MarkdownOutlineParser,
    UmlSequenceParser,
    PrismaParser,
    TerraformParser,
    DockerComposeParser,
    OpenApiParser,
    PipelineDslParser,
    FlowchartParser,
    CloudDslParser,
    // Register layout engines (Legacy fallback)
    DefaultLayoutEngine,
    // Register file detection services
    FileDetectorRegistry,
    FileDetectionService,
    DockerComposeDetector,
    OpenApiDetector,
    TerraformDetector,
    PrismaDetector,
    ReadmeDetector,
    MarkdownDetector,
    SqlDetector,
    JsonDetector,
    YamlDetector,
    // Register extensible Layout Engine plugins
    LayoutRegistry,
    TreeLayout,
    HierarchicalLayout,
    GridLayout,
    DagLayout,
    RadialLayout,
    ForceDirectedLayout,
    // Register Tool registry engines
    CapabilityRegistry,
    ToolRegistry,
    // Register renderer/export adapter plugins
    RendererAdapterRegistry,
    ReactFlowAdapter,
    MermaidAdapter,
    CytoscapeAdapter,
    // Register individual Pipeline Stages
    ValidationStage,
    FileDetectionStage,
    ToolResolutionStage,
    ParserStage,
    LayoutStage,
    RendererStage,
    ResponseStage,
    // Configure and register the pipeline workflow engine
    {
      provide: GenerationPipeline,
      useFactory: (
        val: ValidationStage,
        det: FileDetectionStage,
        tool: ToolResolutionStage,
        parser: ParserStage,
        layout: LayoutStage,
        renderer: RendererStage,
        resp: ResponseStage
      ) => {
        const pipeline = new GenerationPipeline();
        pipeline.registerStage(val);
        pipeline.registerStage(det);
        pipeline.registerStage(tool);
        pipeline.registerStage(parser);
        pipeline.registerStage(layout);
        pipeline.registerStage(renderer);
        pipeline.registerStage(resp);
        return pipeline;
      },
      inject: [
        ValidationStage,
        FileDetectionStage,
        ToolResolutionStage,
        ParserStage,
        LayoutStage,
        RendererStage,
        ResponseStage
      ]
    }
  ],
  exports: [
    ParserRegistry,
    ParserFactory,
    FileDetectionService,
    LayoutRegistry,
    CapabilityRegistry,
    ToolRegistry,
    GenerationPipeline,
    RendererAdapterRegistry,
    ReactFlowAdapter,
    MermaidAdapter,
    CytoscapeAdapter,
  ],
})
export class DiagramEngineModule {}

export type { Diagram, DiagramNode, DiagramEdge, DiagramMetadata, Viewport, Theme } from './interfaces';
export type { IParser } from './interfaces/parser.interface';
export type { ILayout } from './layout/interfaces/layout.interface';
export type { Position } from './types/position.type';
export type { NodeStyle, EdgeStyle } from './types/style.type';
export { DiagramUtils } from './utils/diagram.utils';
export { DetectedFileType } from './file-detector/types/file-type.enum';
export { FileDetectionService } from './file-detector/file-detection.service';
export { LayoutRegistry } from './layout/registry/layout.registry';
export { CapabilityRegistry } from './tool-registry/capability.registry';
export { ToolRegistry } from './tool-registry/tool.registry';
export { GenerationPipeline } from './pipeline/generation-pipeline';
export type { GenerationContext, StageDiagnostic, GenerationRequest } from './context/generation.context';
export type { DiagramGenerationResponse, ErrorResponse, Warning, DiagnosticInfo, ExecutionMetadata } from './contracts/response.contracts';
