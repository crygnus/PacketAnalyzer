package in.ac.bits.protocolanalyzer.protocol;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import in.ac.bits.protocolanalyzer.analyzer.CustomAnalyzer;
import in.ac.bits.protocolanalyzer.analyzer.Session;
import lombok.Getter;

@Component
@Getter
public class ProtocolGraph {

    @Autowired
    Protocol protocol;

    private Map<String, Set<String>> protocolGraph = new HashMap<String, Set<String>>();

    public void configureNode(Session session, String[] graphLines,
            int startLine, int endLine) {
        String nodeName = graphLines[startLine];
        nodeName = nodeName.substring(nodeName.indexOf('_') + 1,
                nodeName.lastIndexOf('_'));
        System.out.println("Node name extracted = " + nodeName);
        configureProtocol(session, nodeName);
        Set<String> toNodes = new HashSet<String>();
        protocolGraph.put(nodeName.toUpperCase(), toNodes);
        int linePtr = startLine + 2;
        while (linePtr < endLine - 1) {
            String[] parts = graphLines[linePtr].split(":");
            String protocolName = parts[1].substring(0, parts[1].length() - 1);
            System.out.println("Protocol name extracted in case statement = "
                    + protocolName);
            toNodes.add(protocolName.toUpperCase());
            linePtr++;
        }
    }

    public void configureSessionCells(Session session) {
        System.out.println("Gonna call configure cells method from session!!");
        System.out.println("Protocol graph so far = ");
        if (protocolGraph == null) {
            System.out.println("protocolgraph is null in Protocolgraph!!");
        } else {
            for (Entry<String, Set<String>> entry : protocolGraph.entrySet()) {
                System.out.println("for protocol :" + entry.getKey());
                for (String str : entry.getValue()) {
                    System.out.println("Attaching: " + str);
                }
            }
        }
        session.connectCells(protocolGraph);
    }

    public void configureStartNode(Session session, String[] graphLines,
            int startLine, int endLine) {
        String protocolName = graphLines[startLine + 1];
        protocolName = protocolName.substring(0, protocolName.length() - 1);
        System.out.println("Protocol name in startGraph = " + protocolName);
        configureProtocol(session, protocolName);

    }

    private void configureProtocol(Session session, String protocolName) {
        CustomAnalyzer analyzer = protocol.getCustomAnalyzer(protocolName);
        System.out.println(analyzer.toString());
        int cellNumber = protocol.getCellNumber(protocolName);
        System.out.println("Cell number returned by protocol = " + cellNumber);
        session.attachCustomAnalyzer(cellNumber, analyzer);
    }

}