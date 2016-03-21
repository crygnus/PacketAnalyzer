package in.ac.bits.protocolanalyzer.protocol;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import in.ac.bits.protocolanalyzer.analyzer.CustomAnalyzer;
import in.ac.bits.protocolanalyzer.analyzer.Session;

@Component
public class ProtocolGraphParser {

    @Autowired
    private ProtocolGraph protocolGraph;

    private Map<String, CustomAnalyzer> protocolMap;

    public void configureSession(Session session, String graphString) {

        String[] graphLines = graphString.split("\\r?\\n");
        removeBlanks(graphLines);
        for (int i = 0; i < graphLines.length; i++) {
            System.out.println(graphLines[i]);
        }
        int linePtr = 0;
        /*
         * Configure start node
         */
        if (graphLines[linePtr].contains("start")) {
            int startPtr = linePtr;
            while (!graphLines[linePtr].contains("}")) {
                linePtr++;
            }
            protocolGraph.configureStartNode(session, graphLines, startPtr,
                    linePtr);
        } else {
            // throw a custom exception which will be caught by session
            // controller and remarks will be passed to front-end?????????
        }
        /*
         * Configure other graph nodes
         */
        linePtr += 2;
        while (!graphLines[linePtr].contains("end")) {
            int ptr = collectNodes(session, graphLines, linePtr);
            if (ptr < graphLines.length) {
                linePtr = ptr;
            } else {
                break;
            }
        }
        protocolGraph.configureSessionCells(session);
    }

    private int collectNodes(Session session, String[] graphLines,
            int linePtr) {
        int startLine = linePtr;
        System.out.println("Start line = " + graphLines[startLine]);
        linePtr++;
        System.out.println("Line ptr line = " + graphLines[linePtr]);
        int lines = graphLines.length;
        System.out.println("Graph lines = " + lines);
        System.out.println("Current linePtr = " + linePtr);
        while (!graphLines[linePtr].contains("graph_")) {
            linePtr++;
            if (linePtr >= lines) {
                break;
            }
        }
        System.out.println(
                "Line ptr line (end of while) = " + graphLines[linePtr]);
        protocolGraph.configureNode(session, graphLines, startLine,
                linePtr - 2);
        return linePtr;
    }

    private void removeBlanks(String[] graphLines) {

        for (int i = 0; i < graphLines.length; i++) {
            graphLines[i] = graphLines[i].replaceAll("\\s", "");
        }
    }

}
