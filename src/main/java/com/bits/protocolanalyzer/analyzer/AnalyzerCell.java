package com.bits.protocolanalyzer.analyzer;

import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.bits.protocolanalyzer.analyzer.event.EndAnalysisEvent;
import com.bits.protocolanalyzer.analyzer.event.PacketProcessEndEvent;
import com.bits.protocolanalyzer.analyzer.event.PacketTypeDetectionEvent;
import com.bits.protocolanalyzer.utils.EventBusFactory;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;

import lombok.Getter;
import lombok.Setter;

/**
 * 
 * @author crygnus
 *
 */

@Component
@Scope(value = "prototype")
@Getter
@Setter
public class AnalyzerCell extends Thread {

    @Autowired
    private EventBusFactory eventBusFactory;

    private String cellID;
    private String eventBusName;
    private EventBus eventBus;
    private GenericAnalyzer genericAnalyzer;
    private PacketWrapper packetProcessing;
    private Queue<PacketWrapper> inputQueue;
    private boolean isProcessing;
    private boolean isRunning;
    private Map<String, AnalyzerCell> destinationStageMap;

    // temp. For testing only
    private int count = 0;

    /**
     * Provide the sessionId in which this cell is placed, the generic analyzer
     * to be placed in the cell and the suffix for eventbus name. The eventual
     * eventbus name will be "sessionId_eventBusNameSuffix".
     * 
     * @param sessionId
     * @param cellID
     * @param analyzer
     */
    public void configure(String sessionId, String cellID,
            GenericAnalyzer analyzer) {

        this.cellID = cellID;
        this.eventBusName = sessionId + "_" + cellID + "_event_bus";
        this.eventBus = eventBusFactory.getEventBus(eventBusName);
        this.genericAnalyzer = analyzer;
        this.genericAnalyzer.setEventBus(eventBus);
        this.eventBus.register(this);
        eventBusFactory.getEventBus("pipeline_controller_bus").register(this);
        this.inputQueue = new ConcurrentLinkedQueue<PacketWrapper>();
        this.isProcessing = false;
        this.isRunning = true;
        this.destinationStageMap = new ConcurrentHashMap<String, AnalyzerCell>();

    }

    /**
     * Receives the next packet (or the same packet if packet type detected has
     * the corresponding analyzer in this cell itself), the type of the packet
     * and startByte location from which the packet should be processed further.
     * 
     * @param packet
     */
    public void takePacket(PacketWrapper packet) {

        this.inputQueue.add(packet);
        /*
         * if (!this.isProcessing) { this.isProcessing = true;
         * process(this.inputQueue.poll()); }
         */
    }

    @Subscribe
    public void end(EndAnalysisEvent event) {
        this.isRunning = false;
    }

    @Override
    public void run() {
        while (isRunning) {
            if (!isProcessing) {
                if (!inputQueue.isEmpty()) {
                    isProcessing = true;
                    process(inputQueue.peek());
                }
            }
        }
        System.out.println("Ending the thread for " + this.cellID);
    }

    private void process(PacketWrapper packet) {
        this.count++;
        System.out.println("Packet processing count for " + this.cellID
                + " is now = " + this.count);
        this.packetProcessing = packet;
        this.genericAnalyzer.analyzePacket(this.packetProcessing);
    }

    /**
     * This method implementation must be annotated with @Subscibe annotation
     * from Google guava library. This is the interface for any custom analyzer
     * in this cell to communicate the detected next packet type and byte-range
     * to be processed with this cell.
     * 
     * @param event
     */
    @Subscribe
    public void setNextPacketInfo(PacketTypeDetectionEvent event) {

        System.out.println(
                "Got inside the packet type detection event handling method in - "
                        + this.eventBusName);
        this.packetProcessing.setPacketType(event.getNextPacketType());
        this.packetProcessing.setStartByte(event.getStartByte());
        this.packetProcessing.setEndByte(event.getEndByte());

        sendPacket();
    }

    private void sendPacket() {

        String destinationStageKey = this.packetProcessing.getPacketType();

        System.out.println("Destinationstage key received for " + this.cellID
                + " is: " + destinationStageKey);
        if (destinationStageMap.containsKey(destinationStageKey)) {
            AnalyzerCell nextCell = this.destinationStageMap
                    .get(destinationStageKey);
            nextCell.takePacket(this.packetProcessing);
            System.out.println("Next cell is " + nextCell.getCellID());
        } else {
            EventBus controllerEventBus = eventBusFactory
                    .getEventBus("pipeline_controller_bus");
            controllerEventBus.post(new PacketProcessEndEvent());
        }

        /* if (this.inputQueue.isEmpty()) { */
        System.out.println("Input queue size for " + this.cellID + " is = "
                + this.inputQueue.size());
        this.isProcessing = false;
        // remove the current packet from the input queue
        inputQueue.remove();
        /*
         * } else { process(this.inputQueue.poll()); }
         */
    }

    /**
     * Adds an entry (packetType, destinationCell) in the destinationStageMap
     * for this object
     * 
     * @param packetType
     * @param destinationCell
     */
    public void configureDestinationStageMap(String packetType,
            AnalyzerCell destinationCell) {
        this.destinationStageMap.put(packetType, destinationCell);
    }

}
