package in.ac.bits.protocolanalyzer.persistence.entity;

import java.io.Serializable;

import javax.persistence.Id;

import org.springframework.data.elasticsearch.annotations.Document;

import lombok.Getter;
import lombok.Setter;

/**
 * Corresponding entity class for ethernet analysis. Corresponding table columns
 * are source_addr, destination_addr and ether_type
 * 
 * @author crygnus
 *
 */

@Getter
@Setter
@Document(indexName = "header", type = "ethernet")
public class EthernetEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private PacketIdEntity packetIdEntity;

    private String sourceAddr;

    private String dstAddr;

    private String etherType;

}
