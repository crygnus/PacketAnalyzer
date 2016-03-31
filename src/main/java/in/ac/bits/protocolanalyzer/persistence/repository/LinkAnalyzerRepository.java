/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package in.ac.bits.protocolanalyzer.persistence.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import in.ac.bits.protocolanalyzer.persistence.entity.LinkAnalyzerEntity;
import in.ac.bits.protocolanalyzer.persistence.entity.PacketIdEntity;

/**
 *
 * @author amit
 */
public interface LinkAnalyzerRepository
        extends ElasticsearchRepository<LinkAnalyzerEntity, String> {

    public LinkAnalyzerEntity findByPacketIdEntity(
            PacketIdEntity packetIdEntity);

}
